# MVP completion and journey refinement

Prepared 5 October 2026. Planning only; no application changes.

This is a follow-up to the [4 October completion plan](mvp-completion-plan.md), assessed against the [release checklist](mvp-release-checklist.md) and current source. It updates the remaining work rather than restarting completed stages. The [earlier review](mvp-review.md) remains historical evidence, not a current inventory of defects.

## Scope and decision boundaries

Sources: both PDFs in `/home/lando/Documents/worththewait`, the repository decision log, shared capabilities, creation and editing screens, host navigation, public invitation renderer, RSVP, invitations, registry, games, media and contact services. This is a source-based review, not a browser, production, security or visual-accessibility certification. No test suite was rerun for this documentation-only task. Previous verification results remain dated results.

Retain the owner decisions already recorded in [open-decisions.md](open-decisions.md): free beta; seven celebration types; registry only for weddings and baby showers; invitation or website for weddings; undated publishing; a shared wedding programme and one wedding-wide RSVP by default; optional separate gathering invitations; invitation image/PDF downloads. Paid plans, Professional tooling, programs and menus remain later work. The older commercial descriptions in the PDFs and repository are superseded by those recorded decisions, not newly resolved by this review.

A simple invitation is a usable landing page: celebration identity, date/time or an undecided state, location/directions, invitation note and RSVP. Downloadable artwork complements that page. A wedding website adds optional story, gallery, programme, dress code, FAQ, accommodation and registry. Do not make ordinary celebrations use a wedding website editor.

**Owner clarification, 5 October 2026:** one reply covers all gatherings that guest is invited to. This explicitly supersedes the older plan's proposal for independent replies per invitation scope and its related acceptance tests. Retain one reply per guest; optional gathering selection changes what the invitation covers, not the number of replies required. No per-gathering response records are needed for MVP.

Keep the existing catalogue/licensing decision unchanged. Curated launch designs, support ownership and operational limits still need explicit release decisions. This plan does not invent quotas, retention periods, licensed status or a new paid offer.

## Reconciliation With the Existing Checklist

| Existing stage | Retain | Remaining direction |
| --- | --- | --- |
| 0: scope | Recorded decisions, shared beta contract, free-beta copy and manual channel sharing | Make presentation rules govern the actual editor and public page, not just available modules and labels. |
| 1: invitation and RSVP | Design/type resolution, recoverable creation errors, general-link replies, distinct same-name guests, guest editing, lifecycle resets and people/reply distinction | Reopen date/time correctness, failed/retried general responses, personal-link reuse, guest-field clearing and truthful sharing status. |
| 2: editing/navigation | Celebration-specific labels, recommended next task, explicit Save, saved preview and selected-guest preview | Reopen navigation continuity, save lifecycle, undated next steps, wedding presentation selection and progressive disclosure. |
| 3: content | Story/practical/RSVP/registry forms, purchase-link renderer, gallery upload/delete | External-only registry remains hidden. Complete games, downloads, gallery metadata/order and robust section editing. |
| 4: publication/support | Visibility controls, unpublish, manual-sharing explanations, legal pages and fuller contact logging | Finish pending-guest reminders, monitored support, private asset access, recovery states and promise verification. |
| 5: verification | Keep historical results as evidence of the earlier change | Clear lint/build/database blockers and prove whole journeys on the release candidate. Do not equate an API or form existing with a completed journey. |

During implementation, add dated acceptance evidence to each affected checklist item. Use distinct states for implemented, verified, partial and blocked. Do not erase the original completion history or mark an entire stage done because its entry point exists.

## Findings That Determine Priority

Severity describes user impact: S4 risks lost work or unintended disclosure; S3 makes a main journey unreliable; S2 causes avoidable friction. These findings are source-supported, with runtime reproduction included in the work below. Closely related symptoms are grouped so the plan remains actionable.

### S4: Protect Work and Private Content

- **R01: Saving can discard work or imply success incorrectly.** In [content-actions.ts](../apps/web/app/(app)/events/[id]/content/content-actions.ts), incomplete story/FAQ rows are filtered away, empty gift/photo submissions redirect with `saved=...`, and saving one section redirects away from all other forms. Those forms have no shared dirty-state protection. [CustomizeEditor](../apps/web/app/(app)/events/[id]/customize/customize-editor.tsx) protects its own Preview/Publish controls but not sidebar/back navigation. Its dirty reset depends on the string `Saved`, so consecutive successful saves need a regression check; a late response also must not clear edits made while saving. Direction: one explicit save contract with field errors, input preservation and protection for every departure, including saving a sibling section.
- **R02: Private-page controls do not protect image URLs.** [main.ts](../apps/api/src/main.ts) serves the upload directory statically; [media.storage.ts](../apps/api/src/modules/media/media.storage.ts) returns those public paths. An event page access check does not prevent a known asset URL being opened independently. Direction: protected delivery for private media, clear behavior when visibility changes or an event is unpublished, and verified durable storage. Do not claim that changing page visibility withdraws previously downloaded copies.

### S3: Complete Reliable Journeys

- **R03: Wedding presentation has no complete host choice.** [beta-capabilities.ts](../packages/shared/src/beta-capabilities.ts) declares both presentations, but [create-flow.ts](../apps/web/lib/create-flow.ts) has no presentation step and the editor's section toggle list omits `WEBSITE`. [eventSurfaceLabel](../apps/web/lib/event-public-sections.ts) infers presentation from that flag while content forms depend on module existence. A wedding can expose story/gallery editors while still labelled Invitation. Direction: an explicit persisted choice with coherent authoring, visibility and preview rules.
- **R04: Timezone controls do not establish timezone correctness.** [event-actions.ts](../apps/web/lib/event-actions.ts) sends an offset-free local datetime and a separate timezone; [events.schemas.ts](../apps/api/src/modules/events/events.schemas.ts) coerces the datetime independently. The editor slices the stored timestamp for its date/time inputs. Schedule and deadline forms have similar local-input handling. Direction: interpret wall time in the chosen event zone and convert back to that zone when editing. Do not invent noon for an omitted time or let saving unrelated details shift the event.
- **R05: General RSVP creation is not one recoverable operation.** [public.controller.ts](../apps/api/src/modules/public/public.controller.ts) creates the respondent before calling RSVP validation/write; [createGeneralRespondent](../apps/api/src/modules/public/public-events.service.ts) persists the guest and invitation first. A closed deadline, invalid party size or later failure can leave a guest without a successful reply, and a retry can create another. Direction: validate and commit consistently, add retry identity/idempotency, and preserve distinct same-name people.
- **R06: Personal-link reuse requires replacement.** [guest-row-actions.tsx](../apps/web/app/(app)/events/[id]/guests/guest-row-actions.tsx) offers Replace link once one exists; [invitations.service.ts](../apps/api/src/modules/invitations/invitations.service.ts) returns the raw link only at issuance. Replacing silently invalidates the old token and the UI exposes plain text rather than a complete share action. The service's send path still records `sent` after a logging-only sender and supplies a general URL. Direction: reusable personal sharing, intentional revocation/replacement, no simulated delivery in production.
- **R07: Some completed registry/gallery claims remain incomplete.** [event-page-view.tsx](../apps/web/app/e/[slug]/event-page-view.tsx) and the hub consider items/cash methods, but not external links, when deciding whether registry exists. [registry-actions.ts](../apps/web/app/e/[slug]/registry-actions.ts) forwards a token but drops access-code context. [registry.service.ts](../apps/api/src/modules/registry/registry.service.ts) guards quantity increments but derives status from a prior read; retry deduplication and reservation correction are absent from this service. Gallery authoring still lacks stored captions, alternative text and order. Direction: finish these as host-to-guest workflows, not independent controls.
- **R08: Required outputs and support are still partial.** Games have backend capabilities but no host/play web flow; invitation image/PDF routes are absent from the web inventory. [contact.service.ts](../apps/api/src/modules/contact/contact.service.ts) acknowledges logged enquiries without a monitored inbox. Retain the unchecked checklist items and finish their full acceptance paths.
- **R09: Failure states can masquerade as missing content.** The [hub](../apps/web/app/(app)/events/[id]/page.tsx) converts event-fetch failure to not-found and guest-fetch failure to zero. The [public page](../apps/web/app/e/[slug]/page.tsx) converts most failures to not-found and optional content failures to absent/empty sections. Direction: distinguish unavailable, missing, denied and genuinely empty; retain recoverable inputs and show retry where useful.

### S2: Reduce Friction and Conflicting Signals

- **R10: Navigation changes shape unexpectedly.** [SiteHeader](../apps/web/app/_components/site-header.tsx) and [MobileNav](../apps/web/app/_components/mobile-nav.tsx) unconditionally offer Sign in. The [app layout](../apps/web/app/(app)/layout.tsx) includes only the header, while the sidebar belongs to the event layout and explicitly disappears on the hub. My events leaves that layout, so the left panel disappears. The hub rail has neither sticky positioning nor an independent scroll boundary. These explain the three reported symptoms without claiming a browser reproduction.
- **R11: Next-step guidance fights the allowed journey.** The hub suggests setting the date whenever it is absent, even after Date to be announced is intentional. It suggests adding guests/address collection before publishing, although [CollectAddresses](../apps/web/app/(app)/events/[id]/_hub/collect-addresses.tsx) requires publication. Shared-link replies do not require a prebuilt list. Published and past events also pass through those same suggestions. Direction: state-aware recommendations with a short path to publishing and sharing.
- **R12: Too much or irrelevant information reaches the wrong audience.** [content/page.tsx](../apps/web/app/(app)/events/[id]/content/page.tsx) stacks every available form and a technical preview checklist. The basic wedding description is still labelled Our story for website mode although the real story editor stores separate content. Guest RSVP uses Joyfully accepts/Regretfully declines for every celebration. The account menu still foregrounds Plan & billing during a free beta. Direction: task-focused sections, precise labels and audience-specific copy.
- **R13: Mobile guest management and routine recovery need refinement.** [guest-table.tsx](../apps/web/app/(app)/events/[id]/guests/guest-table.tsx) requires 860px and shows the same empty message for filtered results; meal and gathering columns appear regardless of whether the host needs them. Guest edits convert empty fields to omitted values, preventing intentional clearing. Address collection lacks close/error controls; clipboard failure is silent. Account menu lacks an Escape handler and menu keyboard behavior. AppNav hides on small screens without equivalent navigation in the account menu.

Retain useful foundations: the shared celebration model, common public/host-preview renderer, general and personal RSVP entry points, party/deadline validation, filtered exports, draft creation, and type-specific labels. The invitation already has content below its artwork; improve its page hierarchy rather than replacing it with a card-only experience.

## Target Experience

### Persistent Host Workspace

Use one host shell across My events, an open event, guest management and account pages. Keep a compact global region for My events and account/help. When an event is open, add its name and local destinations: Overview, Design, Details, Guests, Share, plus Website content only for a wedding website. Offer Gifts for eligible celebrations and Games for baby showers as optional tools. Keep New event accessible without making it the dominant action while someone is finishing an existing event.

My events changes the content and active selection without removing the global panel or retaining stale event actions. Returning to an event restores understandable context. Consolidate the current hub rail and editor sidebar instead of maintaining two different navigation systems.

On desktop, keep navigation in view under the header; constrain it to the available viewport height and let a long navigation list scroll independently. Main content has its own predictable scroll behavior. On mobile, use a compact event header and accessible drawer with close, Escape, focus return and route-change dismissal. Do not place the full 450px desktop rail above every mobile task. Verify short-height screens, zoom, keyboard focus and anchor offsets before choosing final dimensions.

### Creation and Editing

Simple event: choose celebration/design, name the person or occasion, save the draft, edit essentials, preview, publish and share. Wedding: choose Invitation or Wedding website alongside the early basics; use invitation as the recorded default but make the alternative visible. Place role/gathering questions only where they affect the task; allow couples to add gatherings later. Preserve the selected design and existing draft when entering from the catalogue.

The first editor screen should ask for essentials. Optional tools are discoverable without presenting a wall of empty forms. Use one section editor at a time or a deliberately safe save-all design; do not mix several unsaved forms with redirecting individual Save buttons. Offer Add, Edit, Hide and Remove where appropriate. Hide retains authored content. On live pages, explain whether saving immediately changes what guests see; do not add a staged publishing system implicitly.

Invitation mode keeps a compact landing page. Website mode adds a meaningful cover/header and section navigation, with story/photos/practical details the couple has actually chosen. Details, directions and Reply remain easy to reach on a phone. Avoid forcing guests to scroll a long decorative invitation before finding the date or responding. Optional empty sections are omitted, including an empty gallery. The website choice must change the experience, not just its title.

### Guidance by State

| State | Primary action | Secondary information |
| --- | --- | --- |
| Draft with missing required identity/design | Complete that specific item | Saved state and preview availability |
| Draft with essentials, including an intentional undecided date | Preview and publish | Optional date/place/content suggestions, never an endless prerequisite |
| Published, no replies yet | Share invitation | Guest list optional for general sharing; required personal links for private access |
| Published with replies | Review replies | Share again or review pending recipients |
| Past event | Review final replies/export | Optional archive/unpublish and available keepsake content |
| No events | Create an event | A short empty state, without empty dashboard metrics |

### Audience and Tone

Warm and direct for hosts; celebratory in invitation content; plain and reassuring in forms, errors and recovery. Distinguish account owner, organizer and celebrant. Use Design consistently instead of alternating Template, Editor and Invitation for the same task. No em dashes in new copy.

| Reader/context | Show | Avoid |
| --- | --- | --- |
| Signed-out public visitor | Sign in and Create an invitation; Find an event remains easy to locate | Host dashboard language |
| Signed-in public visitor | My events/account and Create an invitation | Sign in or signup prompts; redirecting them away from browsing |
| Host editing essentials | Unsaved changes, Saving, Changes saved, or a specific retryable error | A permanent instruction to remember to save; success after a no-op |
| Wedding invitation host | Details, RSVP, optional gifts/gatherings | Story/gallery/FAQ form stack |
| Couple editing website | Relevant section names, Add your story, Add photos | Module names and rules about internal guest access |
| Guest of any celebration | I'll be there / I can't make it; Not sure yet only when allowed | Wedding-formal language forced onto birthdays or corporate events |
| Guest who replied | Your reply is saved; Change my reply when permitted | A raw private URL as the only return mechanism; any-time promises after a deadline |
| Host sharing manually | Share on WhatsApp; review/send in their app | Delivered or Sent based only on opening the app |
| Host with pending replies | 12 guests haven't replied yet; Review reminders | Remind everyone by default |
| Guest reserving gift | Reserved for you; buy using the shop link | Purchased or payment received without evidence |
| Guest with unavailable page | We couldn't load this invitation. Try again. | Event not found for service failures |

Keep RSVP independent of gifting and guest account signup. Label optional email/phone fields as optional and collect them only with a clear purpose. Offer a usable Change my reply link/button and a copy/save affordance; never use name matching as proof of ownership. A host visiting another person's invitation should still see the guest experience.

## Ordered Work Packages

Effort bands are relative: S is localized; M crosses several screens/services; L changes shared behavior or data contracts. They are not delivery-date estimates. Complete small, reviewable slices within each package.

### 1. Restore Trust in Saved Data and Replies

**Priority:** first. **Effort:** L. **Owner:** full-stack. **Existing plan:** stages 1, 2, 5. **Findings:** R01, R04, R05, R09, R13.

- Define one explicit save lifecycle for basic details and optional content. Preserve invalid/incomplete rows for correction. Block duplicate saves and distinguish the submitted snapshot from newer unsaved edits. Protect sidebar, back, browser departure and sibling-form saves without trapping users.
- Report field-level errors; never return Changes saved when a required name/file is missing. Make partial multi-step failures recoverable, including an uploaded photo whose section-enabling request fails.
- Normalize event, gathering, timeline and deadline timestamps using the chosen zone. Preserve unknown time intentionally. Check clearing optional fields and clearing an existing deadline rather than omitting it from an update.
- Make shared-link guest creation and reply submission atomic or equivalently recoverable. Add retry deduplication without merging people by name; ensure failed validation creates no pending guest. Give successful guests a stable private return path.
- Distinguish service errors, access errors and missing resources. Restore guest list editing success feedback and explicit field clearing.

**Acceptance:** two consecutive edit/save cycles both complete correctly; editing while a save is pending does not erase newer changes; saving a section cannot discard another section's text. A Nairobi time round-trips unchanged on a server in UTC and a guest browser elsewhere; test a daylight-saving zone too. Invalid/closed RSVP creates no extra guest; retry after a lost success response does not duplicate attendance. Error recovery retains input.

### 2. Unify Navigation and Task Guidance

**Priority:** first visible UX pass, after the save contract is defined. **Effort:** M. **Owner:** frontend/design. **Existing plan:** stages 2, 4. **Findings:** R10-R13.

- Make public desktop/mobile headers session-aware. Keep browsing available to returning hosts and preserve intended destinations across sign-in.
- Introduce the persistent host shell described above. Remove competing hub/editor navigation, align labels and active states, and make event switching clear.
- Keep the left panel visible while main content scrolls. Implement mobile drawer and keyboard behavior; give account controls normal dismissal/focus behavior.
- Rewrite next-task selection around draft/live/past states. Allow a no-guest, undated invitation to reach publication and sharing without suggested-task loops.
- Separate genuinely empty lists from filtered empty results. Use compact mobile guest rows and reveal optional meals/gathering controls only when applicable. Make address collection closable and show errors/copy fallback; suppress it when private-access rules make it unusable.

**Acceptance:** traverse My events, event overview, details, guests and share, then Back, with consistent desktop navigation. Test desktop content scrolling and mobile drawer focus/close. Signed-in visitors never receive a redundant Sign in CTA. An undated event with no guests has a clear publish/share path. A narrow phone supports guest editing and sharing without relying on horizontal table scrolling.

### 3. Make Invitation and Wedding Website Distinct Products

**Dependencies:** packages 1-2 conventions. **Effort:** L. **Owner:** full-stack/design/content. **Existing plan:** stages 0, 2, 3. **Findings:** R03, R07, R12.

- Add a clear wedding presentation choice and a persisted source of truth. Define existing-event migration using current content/flags; preview and review ambiguous cases rather than discarding content.
- Apply the capability rules to navigation, editors, API validation, section visibility and public rendering. Toggling a story section alone must not accidentally convert an invitation into a website.
- Permit presentation switching while retaining content. Before changing a live presentation, preview what guests will see and explain any sections being hidden.
- Keep invitation note separate from Our story. Replace the omnibus content page with focused editing and section-specific preview. Ensure section navigation follows rendered order and actual content.
- Refine the simple landing page and wedding website hierarchy. Retain the shared rendering foundation and designs; do not build a general drag-and-drop page builder.

**Acceptance:** a couple can explicitly choose and publish either presentation. Switching away and back retains saved content. A birthday has only its relevant fields and a usable landing page; a baby shower adds only relevant optional gifts/games. A website can publish its essentials with no story/photos yet. Public output and host preview agree, including selected-guest preview.

### 4. Finish Invitations, Replies and Reminders

**Dependencies:** package 1. **Effort:** M-L. **Owner:** full-stack. **Existing plan:** stages 1, 3, 4. **Findings:** R05-R06, R11-R13.

- Provide repeatable personal-link sharing with copy and WhatsApp/SMS/email actions. Choose a secure link recovery/issuance design; do not expose raw links in logs. Separate Reshare from Replace, and explain/confirm invalidation for replacement.
- Disable the logging-only delivery path for production use. Distinguish link created, opened and replied from host-reported sharing. General-link activity must not leave misleading Not shared guidance indefinitely; absence of delivery evidence is not proof that the host has done nothing.
- Add pending-guest targeting, recipient review and editable reminder copy. Exclude people who replied, respect invitation scope, and do not regenerate links as a side effect. With manual sharing, show that the host must send each message; do not promise automated delivery.
- Improve RSVP confirmation, private return-link usability, answer prefilling and closed-response guidance. Keep party totals separate from replies; label meal aggregates according to what is actually collected rather than implying per-person meal counts.
- Apply the confirmed one-reply rule: show the gatherings covered by the guest's invitation before they answer, retain one response per guest, and include their assigned gatherings alongside that response in host views/exports. Keep gathering selection optional and preserve the normal wedding-wide flow. If a host changes a guest's gatherings after a reply, show the existing reply and changed coverage clearly and offer a reviewed update message; do not fabricate a new reply or send a message automatically.

**Acceptance:** reshare a personal invitation after leaving/reopening the guest list without invalidating the earlier link. Replacement has a clear warning and verified lifecycle behavior. Reminder recipients match the pending filter and can be reviewed before sending. A guest can reopen and change a valid reply without retyping prior answers. One reply covers the displayed invited gatherings; there are no per-gathering acceptance controls or duplicate reply counts. Cross-event access remains denied.

### 5. Complete the Remaining Content and Output Capabilities

**Dependencies:** packages 1 and 3; private access from package 6 before launch. **Effort:** L, split into four deliverable slices. **Owner:** full-stack/design. **Existing plan:** stage 3. **Findings:** R07-R08.

| Slice | Direction | Completion evidence |
| --- | --- | --- |
| Registry | Count external registries as content; preserve supported guest access on claims; add host item editing and intentional reservation correction; derive quantities/status consistently and deduplicate retries | External-only registry visible in live view and preview. Simultaneous last-item claims and retries cannot over-reserve or leave incorrect status. A reservation is never described as payment. |
| Gallery | Store captions, alternative text and position; allow arrange, edit, delete and hide without destroying content; clarify cover versus gallery membership | Order/text persist after reopening and deployment. Keyboard users can reorder without dragging. Empty galleries do not produce empty navigation. Private media follows the access policy. |
| Baby shower games | Use existing game definitions for host setup, optional enable/close, guest play, confirmation and host results/export | Each retained format works through the UI; validate answers, protect answer keys, handle retries/closed games and preserve private access. Any reduction of promised formats requires an explicit scope decision. |
| Downloads | Generate actual invitation image/PDF files from saved content with usable RSVP link/QR; offer download preview and retry | Inspect files on phone/desktop, long names, undated and dated events, venue details and multiple designs. QR opens the intended live page. Private invitations never embed a general inaccessible link or another guest's link. Draft output is clearly identified; no programs/menus added. |

Review a curated design set visually, including the brief's 10-15 wedding designs, instead of treating catalogue row count as finished design coverage. Check that artwork does not expose design names as guest content and that the actual page is readable for every selected palette. Preserve the recorded licensing decision and seek owner disposition before advertising affected designs.

### 6. Close Publication, Privacy and Support Gaps

**Dependencies:** can start alongside package 1; all retained surfaces before release. **Effort:** M-L. **Owner:** backend/operations/product. **Existing plan:** stages 4-5. **Findings:** R02, R08-R09.

- Protect private media and validate the access behavior of preview, registry, games, exports and downloads. Check revoked links and publication/visibility changes, including cached responses and metadata. Shared details of public gatherings are not made secret by recipient selection.
- Make publishing readiness consistent between UI and API without requiring a date, guest list or optional website content. Confirm saving live changes, unpublishing and republishing produce the expected guest view.
- Finish contact delivery with durable acceptance, a monitored destination, failure/retry and a named operational owner. Confirm any support/account-recovery claims have a usable path. The route inventory contains no password recovery flow; settle a dependable beta recovery route before relying on self-service accounts.
- Verify retention/deletion/support language against actual operations; complete an owner-approved request-handling path where self-service controls do not exist. Do not infer legal approval from a terms page being present.
- Audit remaining public promises, vendor records/contact links, beta catalogue access, unused billing emphasis and testimonials. Vendor discovery remains secondary; no booking/availability promises without working data and behavior.
- Verify uploads, durable storage, backup/restore, monitoring, deployed link origins and rollback in the target environment. Do not perform destructive infrastructure work without approval.

**Acceptance:** private bytes cannot be fetched just by copying a static asset URL; publication/access changes follow the agreed policy. A contact enquiry reaches a monitored destination and can be recovered after a transient failure. Owner-approved support/recovery and retention procedures can actually be followed. No advertised launch action requires an unavailable upgrade or simulated delivery.

### 7. Prove the Release Through Complete Journeys

**Dependencies:** all retained work above. **Effort:** M. **Owner:** engineering/QA and product. **Existing plan:** stage 5.

Resolve the checklist's recorded lint compatibility, font-fetch build and test-database blockers in a reproducible environment. Confirm whether each still reproduces before changing dependencies or configuration. Run the smallest relevant automated checks per implementation slice, then one integrated release pass; use current project-pinned documentation when choosing framework/library fixes.

| Journey | Required variants |
| --- | --- |
| Simple celebration | Parent organizing a birthday; design-first entry; undecided date; no preloaded guest list; all other simple types smoke-tested |
| Wedding | Invitation and website; optional content; presentation switch; shared programme; optional gathering selection with one reply covering all invited gatherings |
| Baby shower | Invitation, gifts, games, results/export |
| Guest | General and personal links; same-name guests; retry; already replied; deadline; private/revoked/unpublished states |
| Returning host | Saved draft, repeated saves, unsaved navigation, live edits, next steps, My events and event switching |
| Outputs/operations | Image/PDF inspection and QR; durable/private photos; monitored support; filtered attendance/export |

Use browser checks and screenshots at approximately 360px, 768px and 1440px widths, plus short-height desktop and 200% zoom. Exercise navigation scrolling, drawers/dialogs, keyboard focus, reduced motion, contrast and text overflow. Include a mobile in-app browser/share round trip, slow connection and failed saves. Never record private guest URLs or personal answers in screenshots or analytics intended for broad sharing.

Run a short observed trial with a couple, an organizer creating someone else's celebration and guests of differing phone familiarity. Success means they can identify what is saved/live, publish without completing optional tasks, find the date/place, reply without an account and understand whether sharing actually sent anything. The earlier five-minute host and one-minute guest targets remain proposed trial goals, not measured claims.

**Release gate:** no unresolved lost-work/private-disclosure defects; all retained MVP capabilities pass their whole journey; remaining S3 issues require explicit owner disposition. Record environment, revision, date, result and remaining limitations. This review itself does not certify release readiness.

## Delivery Order and Boundaries

Start with package 1 and private-media investigation from package 6. Follow with the persistent shell and guidance in package 2, then presentation/editor coherence in package 3. Complete package 4 using the confirmed one-reply rule, and deliver the four package 5 slices individually. Finish package 6 operational acceptance and package 7 release evidence before launch.

Local improvements such as session-aware CTAs, filtered empty text, truthful share wording and the undated next-step correction can ship early once independently verified. They must not be used to close broader acceptance items prematurely.

This plan adds no paid checkout, Professional workspace, vendor booking, automated messaging campaign, guest-upload gallery or unrestricted website builder. Further product conflicts should be recorded and brought to the owner before committing to the affected behavior. The current task authorizes this document only, not implementation.
