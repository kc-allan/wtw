# Free beta production implementation plan

## Purpose

This is the authoritative implementation specification for preparing Worth
the Wait for a public free beta. It is based on current application behavior
and confirmed product decisions. Older planning documents are evidence only;
update or deprecate any statements that conflict with this plan.

## Confirmed product decisions

- The release target is a free beta. Payments, paid upgrades and Professional
  workspace tooling stay out of this release.
- Event visibility has two choices: **public** and **private**. New events
  default to private. Public events are reachable by anyone with their event
  link and may accept RSVPs without a personal invitation. Private events
  require a valid personal invitation for guest-facing pages and endpoints.
  Authenticated owner membership authorizes host operations and media access,
  including for default-private events. Public event pages are indexable by
  search engines. Private pages are excluded from sitemaps and marked
  `noindex`.
- Existing events currently marked `unlisted` will become private during the
  visibility migration.
- Cloud media storage is Cloudflare R2. Keep its bucket private and issue
  short-lived signed read URLs only after checking event access.
- Support messages go to a configurable support address, initially
  `support@domain.com`. Sending runs asynchronously with exponential retry.
  Hard failures go to a separate mailing log file.
- For active accounts, completed event, guest, RSVP, registry, game and media
  data is retained for 90 days after the event completes, then deleted. Account
  closure immediately revokes access and removes live database records, while
  physical media deletion is queued until confirmed. Existing signed media URLs
  may remain valid for up to 10 minutes. Account closure takes precedence over
  the 90-day event retention period.
- Each resolved guest may have one answer per baby-shower game. Updates replace
  the prior answer. A public visitor may play using a name without an account,
  but must create an account or sign in before editing that answer. The plan
  must track answer ownership in the browser and bind only that browser's
  answers to the account after sign-in. Editing is supported in the same
  browser only; a display name alone is not identity proof.
- Support enquiries are not linked to accounts and remain until a support
  operator manually deletes them.
- Commercial rights for the designs listed in `docs/open-decisions.md` remain
  open and are not resolved by this plan.
- Turnstile verification applies to all forms.

## Current stored-file inventory

### User content that belongs in runtime storage

| Content | Current format | Current size evidence | Frequency/count evidence | Production storage requirement |
| --- | --- | --- | --- | --- |
| Host-uploaded cover and gallery images | JPEG, PNG, WebP, AVIF, GIF, based on the client-provided MIME type | `MEDIA_MAX_BYTES` is configured to 8 MiB per file. This is an intended limit, not a currently enforced request limit. Files are stored as uploaded; there is no resizing or format conversion. Actual typical size is unknown. | One upload is one `MediaAsset`; no per-event or per-account count limit is present. Public gallery responses cap at 200 items. No observed upload rate or retention duration is available. | Preserve original bytes and metadata. Store the object key and verified metadata in Postgres. Enforce request size before buffering and inspect actual file contents before accepting. |

`MediaAsset` metadata currently includes an object URL/key, claimed MIME type,
byte size, optional dimensions, caption, alt text, ordering and hidden status.
Current files are written to local disk. The image MIME type is trusted from
the request, and the configured limit is checked after Multer has already
buffered the file. The R2 migration removes the durable URL field and stores
the object key instead. Do not use the 8 MiB setting as a measured average or
as evidence that memory use is currently bounded.

### Files that are not runtime customer uploads

| Content | Format and current footprint | Storage treatment |
| --- | --- | --- |
| Invitation and celebration artwork bundled in `apps/web/public` | 56 files, 27,541,531 bytes (about 27.5 MB or 26.3 MiB) across images, SVGs and other static assets | Deployed with the web application. This is a current repository footprint, not customer media usage or cloud-storage demand. |
| Invitation downloads | Generated SVG or PDF on request | Streamed as a download; not persisted by the application. Typical generated size has not been measured. |
| Vendor, registry and external media | URLs saved as database text fields | The application does not currently ingest these files. External hosting and availability are third-party dependencies. |
| Contact submissions | Text fields in Postgres; no attachments | Not object-storage files. Delivery and retention require operational decisions below. |

### Missing inputs for storage sizing

The repository does not provide observed upload frequency, average or
distribution of upload sizes, number of images per event, event volume, image
retention period, deletion rate, or expected growth. Collect these figures
before estimating R2 storage and uptime costs. This plan does not estimate
those costs.

## Implementation stages

Stages are dependency-ordered. Each stage must be verified before production
release. Do not start implementation until this plan is approved and the open
questions below are resolved where they affect behavior.

### Stage 0: establish safe beta behavior and scope

- Replace the three-state visibility contract with public/private across shared
  types, API validation, database schema, host controls and public access checks.
- Set private as the default for newly created events at both API and database
  layers.
- Remove the access-code field and query parameter from the API, database,
  forms and docs. Personal invitations authorize guest-facing private event
  pages and endpoints. Authenticated owner membership authorizes host
  operations and media access without requiring a guest invitation.
- Migrate existing unlisted events to private, as confirmed. Preserve slugs,
  event content and invitations. Verify valid personal links still work and
  general links no longer reveal the event. Back up the database first, update
  old `unlisted` rows to `private`, remove the access-code column, replace the
  database enum with only `public` and `private`, and set its default to
  `private` in the same controlled migration release.
- Remove unlisted-specific UI, help copy and test fixtures. Define public as
  link-accessible, indexable and RSVP-enabled. Give public event pages
  canonical metadata and include them in the public-event sitemap. Exclude
  private pages from sitemaps and emit `noindex` metadata for them. This adds
  search-engine indexing, not an in-app event search or directory. Include
  only published public events in the sitemap.
- Add an explicit visibility control to event settings. Explain that public
  pages can be opened and RSVPed to by anyone with the link, and private pages
  require a personal invitation. Require an explicit host choice to make an
  event public.
- Mark events changed from unlisted to private in the migration and show their
  host a one-time notice with the visibility control. Explain that the page is
  private and that the host can choose public if they want anyone with the link
  to open and RSVP. Clear the notice after the host reviews visibility.
- Ensure every private page and guest-facing endpoint requires a valid personal
  invitation.
- Keep beta entitlements consistent: no checkout or paid upgrade prompts; keep
  registry eligibility limited to weddings and baby showers.
- Review application copy against the global rules: avoid em dashes and avoid
  exposing internal mechanics in host or guest language.

**Acceptance:** a new event is private unless its host chooses public; a public
event link can be opened and used for a general RSVP and can be indexed; an
uninvited visitor cannot view or respond to a private event; the migration
closes access to existing unlisted general links without invalidating personal
invitations.
Draft and private events are absent from sitemaps, and private pages return
`noindex` metadata.

### Stage 1: resolve form abuse protection

- Add Turnstile site key and secret configuration with startup validation for
  production. Keep test keys or an explicit local development mode isolated
  from production configuration.
- Add one server-side verification service that calls Cloudflare verification
  and validates `success`, the exact production hostname and the expected
  action for each form. Use separate production and test widget credentials.
- Add a reusable web form integration that obtains a challenge response,
  submits it with the form, and presents recoverable failure states.
- Apply verification to every user-submitted form, including registration,
  login, contact, event creation and editing, guest management, invitation
  actions, public RSVPs, guest-list joins, registry claims, games and content
  uploads. Apply verification at the write boundary, not only in the browser.
- Validate every token before processing its write. Treat tokens as single-use
  and valid for no more than five minutes; never log them. Retry Siteverify
  transport failures with the same Siteverify idempotency key, but require a
  new widget token after failed or expired validation. Keep rate limits as a
  separate control. Follow [Cloudflare's server-side validation guide](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- Add test coverage for missing, invalid, expired, replayed and valid challenge
  tokens, and for provider timeout/failure behavior.

**Acceptance:** every form-backed mutation is rejected by the server when
Turnstile verification fails; successful form behavior remains understandable
with keyboard and assistive technology; provider outages return a clear retry
path and do not silently bypass verification in production.

### Stage 2: repair session refresh and align token lifetimes

- Make the web session refresh decision account for expired access tokens, not
  just absent cookies. Ensure an expired access token cannot be forwarded to
  the host API as if the session were current.
- Decode the authenticated access token's `exp` value in the web server and
  refresh when missing or within 60 seconds of expiry. Set cookie `Max-Age`
  from that same `exp` value, so the browser cookie cannot outlive the access
  token. Keep refresh-cookie expiry aligned with the API's configured refresh
  expiry.
- Make refresh-token rotation atomic. Store an encrypted copy of the rotated
  token pair for the spent token and allow the same refresh request to replay
  that pair for 30 seconds, then reject it. Encrypt replay data with a dedicated
  secret and delete it after the grace period. This makes simultaneous tabs
  converge on one rotated pair without allowing indefinite token reuse.
- On refresh failure, clear both cookies consistently and return the user to
  sign-in with a safe local continuation destination.
- Verify logout revocation, account deletion/revocation behavior, refresh
  expiry, clock boundaries and cookie flags in production configuration.

**Acceptance:** expired sessions refresh and continue; revoked/expired sessions
are cleared; concurrent page loads do not randomly invalidate each other;
cookie expiry tracks the API token expiry.

### Stage 3: make shared-link RSVP safely retryable

- Define an idempotency contract for public RSVP submissions that do not carry
  an existing personal invitation token. Do not use a guest name or email as
  identity proof.
- Generate a cryptographically random 256-bit submission key in the guest form
  and keep it in session storage until a definitive success response. Reuse it
  for retries after timeouts or lost responses.
- Persist the key and outcome with a uniqueness constraint and create the
  guest, invitation and RSVP in one transaction. A retry with the same key must
  return the same logical result and the same private return link without
  creating another guest.
- Store only a keyed hash of the idempotency key and the existing invitation
  token hash. Derive the same private return token from the idempotency key
  using a dedicated server secret, so the API can reproduce it for a retry
  without persisting a raw token. Delete idempotency records with their event
  under the agreed data-retention policy.
- Keep separate submissions from genuinely different visitors distinct, even
  when names match. Apply the same retry analysis to invitation issuance,
  registry claims and game submissions where duplicate requests have user or
  data consequences.

**Acceptance:** simulate a committed RSVP whose response is lost, then retry
with the same key; exactly one respondent and RSVP exist and the guest receives
the same valid change link. A distinct key creates a distinct respondent.

### Stage 4: finish support delivery and operational inbox

- Add configurable `SUPPORT_EMAIL` and an outbound mail provider configuration
  without committing credentials. Deliver contact-form submissions to the
  configured support address.
- Preserve the enquiry in Postgres before queueing mail so provider outages do
  not lose the message.
- Add a durable outbox/queue record and background worker. Track queued,
  attempting, delivered and failed states, attempts, next attempt and provider
  reference.
- Retry transient errors after 1 minute, doubling each delay, capped at 6 hours,
  with up to 20 percent jitter and at most 8 attempts. Classify permanent
  provider errors as hard failures immediately; mark exhausted transient errors
  as hard failures after the final attempt. Make worker processing idempotent.
- Write hard failures as one JSON record per line to
  `/var/log/worththewait/mailing-failures.jsonl`, with mode `0640`, daily
  rotation, 90-day retention and persistent VPS storage. Ship rotated copies to
  the configured log destination. Record enquiry ID, provider, error class,
  attempt count and timestamps only. Do not log credentials, recipient address
  or message body.
- Configure delivery with `SUPPORT_EMAIL` and provider credentials. The
  recipient defaults to `support@domain.com`; changing this environment value
  changes the destination without a code or database edit. Keep delivery behind
  a provider-neutral mailer interface and select the sending provider in the
  implementation slice.
- Remove contact name, contact address and message body from application logs.
  Log only the enquiry ID and delivery state. Keep the original enquiry in
  Postgres and make it available through the operator support workflow.
- Add health/metrics for queue age, retry volume and hard failures, and a
  protected support inbox for authorized operators to review, respond to and
  manually delete enquiries. Record deletion metadata without retaining the
  enquiry content. Add a support runbook for retrieving and responding to
  stored enquiries.
- Add provider contract tests and a staging integration check that sends only
  to an approved test recipient.

**Acceptance:** accepted contact submissions persist even when email is down;
transient failures retry on schedule; permanent failures are visible in the
mailing log and database; successful delivery is recorded once; a support
operator can find the original message.

### Stage 5: secure media and produce storage evidence

- Instrument uploads to measure file count, byte-size distribution, event and
  account association, failures and deletion. Do not record image contents or
  sensitive filenames. Collect actual beta usage before the owner estimates
  storage and uptime costs. Cloudflare R2 is selected; the measurements inform
  capacity and cost planning, not provider selection.
- Enforce the configured body/file limit before memory buffering. Apply an 8
  MiB per-file cap and a 9 MiB total request cap to the single-file upload
  route at Multer, the HTTP server and the VPS reverse proxy.
- Preserve existing accepted formats: JPEG, PNG, WebP, AVIF and GIF. Validate
  file signatures and decode every image rather than trusting MIME headers or
  extensions. Reject malformed images and images over a configured pixel
  limit of 40 megapixels. Do not accept SVG uploads. Preserve original bytes;
  do not add transformations in the beta.
- Add `R2MediaStorage` behind the existing `MediaStorage` interface. Extend
  the interface with authorized read-URL signing; make `save` return object key
  and size without a durable public URL. Use
  `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` against Cloudflare
  R2's S3-compatible API, with
  `region: "auto"`, the account endpoint, and credentials restricted to the
  single application bucket. Use `PutObject` for validated uploads,
  `DeleteObject` for removal, and `GetObject` signing for reads. Keep
  `LocalDiskStorage` for local development only. See [Cloudflare's S3 API guide](https://developers.cloudflare.com/r2/get-started/s3/)
  and [presigned URL guide](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).
- Keep the R2 bucket private. Never persist a signed URL in `MediaAsset.url`:
  it expires and acts as a bearer credential. Remove the `url` database field
  and persist the object key and verified metadata, then mint a 10-minute GET URL
  only when a read is authorized. Public event images may be signed for any
  visitor after verifying the event is public. Private event images may be
  signed only after validating a personal invitation. Do not accept access
  codes as private-event access.
- Use presigned links on the R2 S3 API endpoint, not a custom media domain.
  Treat each link as a bearer credential and never place it in logs or durable
  database fields.
- Update host and guest media responses to issue short-lived URLs at read time.
  Do not cache signed URLs past expiry or log their query strings. Verify public
  pages remain indexable while private pages and their media require an
  invitation. Every guest media read must also verify the event is published,
  the gallery module is enabled and the asset is not hidden. Every host media
  read must verify account membership and that the asset belongs to the event.
- Add production configuration for `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`,
  `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`. Derive the default S3 endpoint
  from the account ID.
  Support a jurisdiction-specific endpoint only when the chosen bucket
  jurisdiction requires it. Keep secrets in the VPS secret store.
- Store keys under an opaque event/account prefix with a cryptographically
  random object name. Do not use uploaded filenames or user-supplied paths in
  object keys.
- Migrate any existing production local media before switching reads: match
  each `MediaAsset` row to its local object, upload to R2, compare byte length
  and checksum, update the row to the R2 object key, verify cover and gallery
  rendering, then remove local copies after a verification window. Produce a
  reconciliation report for missing files and orphaned R2 objects.
- Ensure event and media deletion remove R2 objects safely through a durable
  deletion record that can retry if the database or R2 operation fails. Add a
  periodic reconciliation job for orphaned objects and missing database
  references. Include R2 objects in retention and recovery procedures.
- Test upload, signed reads, expired URLs, unauthorized private reads,
  deletion, missing objects, provider outage, credential rotation, migration
  and restore in a dedicated staging bucket. Run mocked contract checks in CI
  and credential-gated integration checks in staging.

**Acceptance:** limits apply before buffering; content validation rejects
spoofed or malformed files; the R2 bucket has no anonymous access; signed reads
are created only after event, module, asset-visibility and host-membership
checks; private URLs expire after 10 minutes; uploads survive deploys; deletion
and reconciliation work; R2 objects are included in recovery procedures.

### Stage 6: close usability and feature-completeness gaps

- Add unsaved-change protection and field-level error preservation to optional
  content forms. Ensure preview/publish never silently uses stale saved data.
- Add QR codes to invitation downloads, verify SVG/PDF rendering and inspect
  downloads at representative phone and print sizes. Ensure the link and QR
  contain no private invitation token in a reusable/general download.
- Complete game close timing and retry-specific guest feedback. Enforce one
  submission per resolved guest and game with a unique database constraint;
  resubmission updates the existing answer, and host exports show the latest
  answer. Keep name-only public game play. Require account creation or sign-in
  before a name-only player can edit. Track anonymous answer ownership in the
  submitting browser with a secure participant credential; after successful
  sign-in, associate only answers proven by that credential with the account.
  Do not authorize edits by display name or support cross-device claim/recovery
  in the beta. Use the account identity for subsequent edits and enforce
  ownership server-side.
- Add registry claim cancellation/correction and safe duplicate retry behavior.
  Preserve atomic quantity limits and test concurrent claims and status
  consistency.
- Reject invalid ceremony assignments instead of silently dropping them.
- Correct host attendance summaries and meal counts so the displayed unit is
  clear and corresponds to actual attendees/selections.
- Add safe account data export and account closure, including a review of
  cascading data and media removal. Add a daily retention worker that deletes
  completed-event data 90 days after the completion date, including guests,
  invitations, RSVPs, registry claims, game submissions and R2 objects. Treat
  `endsAt` as the completion date when present, otherwise use `startsAt`; for a
  multi-ceremony wedding use the latest ceremony end, falling back to its start.
  Undated events do not expire automatically. On account closure, immediately
  block access, revoke sessions and invitations, remove live database records,
  and queue R2 deletion until confirmed. Existing signed media URLs expire
  within 10 minutes. Apply backup expiration and deletion replay rules so a
  restore cannot resurrect deleted account or event data.
- Replace invitation-token query use after first open with a server-side
  exchange: validate the token, set a Secure, HttpOnly, SameSite=Lax guest
  session cookie, then redirect to the same event URL without the token.
  Update RSVP, games, registry, gallery and ceremony filtering to use that
  server-held session. Do not serialize the raw invitation token into page
  markup or client props. Set `Referrer-Policy: no-referrer`, prevent third
  party resources on guest pages, and redact query strings from application and
  reverse-proxy logs.
- Add CSRF and origin checks to cookie-authenticated state-changing actions.
  Scope guest cookies to the site and re-check invitation revocation on every
  protected API request.
- Establish fail-closed role handling for existing account membership roles.
  Until collaboration is in product scope, only owner membership should gain
  event-management access; do not treat stored admin/editor/viewer labels as
  implemented permissions.
- Verify vendors and public claims, contact paths and price units. Remove any
  unsupported availability, booking, pricing or reputation claims.
- Remove em dashes from user-facing website/application content and ensure new
  copy does not expose storage, queue, token or other implementation details.

**Acceptance:** incomplete form edits cannot be lost without warning; guest
actions have clear retry/closed states; download artifacts are readable and
safe to share; hosts can correct guest, registry and account data; unimplemented
vendor claims are absent.

### Stage 7: stack-specific CI and third-party integration checks

- Add CI for the pnpm workspace and its pinned toolchain. Cache dependencies
  safely and run the shared package build before dependent apps.
- API checks: lint, build, unit tests, schema/migration validation and e2e
  workflows against an ephemeral Postgres service.
- Web checks: lint, TypeScript, production build and browser tests for the main
  host and guest journeys, including responsive and keyboard paths.
- Repair the current web lint/tooling incompatibility before making lint a
  required gate. Make production builds repeatable by self-hosting build-time
  fonts or documenting and enforcing the required network access; do not mark
  a skipped build as passed.
- Cross-stack integration: run API + web against Postgres for create, publish,
  public/private access, RSVP retry, media handling, support enqueue and
  authenticated host workflows.
- Add isolated contract tests for Turnstile, outbound email and cloud storage;
  add gated staging integration checks for provider credentials, signed media,
  challenge verification and test-recipient mail delivery.
- Keep production secrets out of CI logs and artifacts. Use least-privilege,
  short-lived CI credentials where supported. Do not let ordinary pull-request
  jobs send real support mail or write production media.
- Make test failures block releases. Record known external-service limitations
  explicitly instead of treating skipped checks as passed.

**Acceptance:** a clean checkout can pass required CI with no production
credentials; staging checks exercise each configured external integration;
release artifacts identify the commit and migration set.

### Stage 8: VPS continuous delivery and release operations

- Document the target VPS topology, supported Node/runtime versions, process
  supervision, reverse proxy/TLS, domain routing, firewall/ports, health checks
  and environment-specific configuration. Keep secrets out of the repository
  and image/build artifacts.
- Before configuring CD, record the actual VPS OS, public hostname, database
  placement, deploy account, network path and available persistent volumes.
  Keep the production database and R2 credentials outside the web container;
  expose only web traffic through the TLS reverse proxy.
- Configure CD for the VPS only after CI is reliable: build immutable
  artifacts, deploy to a staging target, run smoke/integration checks, then
  promote with a reversible release procedure. Define rollback behavior for
  app and database changes.
- Run Prisma migrations as an explicit pre/post-deploy release step with
  backup and compatibility checks. Never run development reset/seed commands
  against production.
- Document automated database backups, encryption, retention, off-host copy,
  restore drills and recovery objectives. Include R2 object inventory and
  recovery procedures; database-only backups do not restore uploaded objects.
- Before release, approve backup retention, recovery point objective (RPO),
  recovery time objective (RTO), and the off-host backup destination. Schedule
  automated backups, alert on missed runs, and demonstrate a restore of both
  Postgres data and representative R2 media in staging.
- Document secret inventory, provisioning, access, rotation, revocation and
  incident response for database, JWT, invitation, Turnstile, storage and mail
  credentials.
- Add monitoring and alerting for availability, API errors/latency, database
  health/capacity, queue age/delivery failures, storage errors, disk usage and
  backup completion. Ensure health endpoints distinguish process liveness from
  dependency readiness.
- Establish log redaction, retention, access and rotation. Keep mailing hard
  failure records separate and persistent as described in Stage 4.
- Write release checklist, operator runbook, incident contacts, support
  ownership, rollback steps and post-deploy verification.

**Acceptance:** a staging deploy and rollback are repeatable; a restore drill
recovers database and media to documented recovery points; operators receive
alerts for failed backups, mail backlog and service degradation; no production
secret or customer data appears in CI output.

## Open decisions and evidence gates

- **Storage sizing:** collect upload frequency, average/percentile sizes,
  images per event, active event volume and growth window. Retention is defined
  above. The owner will use this evidence to estimate R2 storage and uptime
  costs. This plan does not estimate those costs.
- **Support delivery:** choose the email provider and who owns the support
  inbox. `support@domain.com` is the initial configurable recipient.
- **VPS operations:** confirm the VPS host/OS, database placement, off-host
  backup destination, backup retention, RPO and RTO before configuring CD.
- **Commercial rights:** keep the existing open decision and affected design
  inventory in `docs/open-decisions.md`; do not represent rights as cleared.

## Release gates

The free beta is ready for production only when:

1. Public/private access and the migration pass end-to-end tests.
2. Turnstile is enforced server-side on every in-scope form.
3. Session refresh and shared-link RSVP retry behavior pass concurrency and
   failure tests.
4. Support mail queues, retries, records and hard-failure logs are operational.
5. Upload caps and content validation are enforced, and R2 has passed
   integration, persistence and restore checks.
6. Private media uses expiring signed URLs.
7. Confirmed usability, data lifecycle and security gaps are closed or explicitly
   removed from beta promises.
8. CI, staging checks, VPS deployment, migration, backup/restore, monitoring,
   secrets and rollback runbooks have been exercised.
9. No commercial-rights claim is made for designs whose rights remain open.
