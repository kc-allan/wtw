# MVP release checklist

Prepared 4 October 2026. Source decisions are recorded in `docs/open-decisions.md`; implementation scope is sequenced in `docs/mvp-completion-plan.md`.

## Confirmed beta scope

| Decision | Release rule |
| --- | --- |
| Registries | Available only for weddings and baby showers. |
| Pricing | Beta is free. Paid plans, checkout and Professional accounts are later work. |
| Wedding presentation | Weddings start as a simple invitation. A full wedding website remains an optional presentation. |
| Publishing date | Events can publish without a date and show Date to be announced. |
| Wedding RSVP | The shared wedding link collects one wedding-wide RSVP by default. |
| Gathering invitations | Separate gathering invitations are optional exceptions, not normal onboarding. |
| Downloads | Invitation images and PDFs belong in beta. Programs and menus come later. |

## Stage 0 checks

- [x] Product decisions D1-D3 and D5-D7 recorded.
- [x] Shared beta capability contract added in `packages/shared/src/beta-capabilities.ts`.
- [x] Wedding defaults start with invitation and RSVP, with website sections off until chosen.
- [x] Marketing pricing and billing copy state free beta access instead of unavailable checkout.
- [x] Manual WhatsApp, SMS and email sharing remains the beta delivery path.

## Stage 1 checks

- [x] Template entry resolves the design's celebration type before draft creation.
- [x] Creation failures return to the form with preserved draft inputs and a visible error.
- [x] Date, time and timezone are collected separately.
- [x] Host editing supports clearing date and location details.
- [x] Publishing without a date is allowed in the host UI.
- [x] Public payloads include the event city used by guest pages.
- [x] Shared-link RSVP creates a distinct respondent and returns a private change link.
- [x] Name-only guest-list joins no longer overwrite an existing guest.
- [x] Private events do not accept open guest-list joins.
- [x] Guest rows expose contact, party allowance, edit, remove and private link actions.
- [x] Invitation reissue resets revoked, expired, opened and responded lifecycle fields.
- [x] Attendance cards distinguish replies from people attending.

## Stage 2 checks

- [x] Host hub opens with event context, saved state and a recommended next step.
- [x] Invitation and Wedding website vocabulary follows the saved event presentation.
- [x] Customize uses celebration-specific labels and explicit save states.
- [x] Preview and publish actions use saved values.
- [x] Host preview can render a selected guest without issuing or opening an invitation.
- [x] Public and host preview navigation share the same section visibility rules.

## Stage 3 checks

- [x] Host content area added for story, schedule, FAQ, dress code, accommodation, RSVP settings, registry settings, registry items and gallery uploads.
- [x] Public registry displays external registries and purchase links.
- [x] Gallery uploads are host-only and publish through the enabled gallery section.
- [x] Baby shower games have host setup, guest-facing play, host preview support and CSV answer export. Verified 5 October 2026 with `pnpm --filter @wtw/shared build`, `pnpm --filter @wtw/web exec tsc --noEmit`, `pnpm --filter @wtw/api test` and `pnpm --filter @wtw/api build`. Closed-game timing and retry-specific UX remain follow-up.
- [x] Invitation downloads generate SVG image and printable PDF artifacts from saved event content with the live RSVP link. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`. QR generation and device inspection remain follow-up.
- [x] Gallery captions, alternative text, manual ordering and hide-without-delete controls have storage and host/public UI support. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`, `pnpm --filter @wtw/api test` and `pnpm --filter @wtw/api build`. Keyboard-specific reorder controls and private media delivery remain follow-up.

## Stage 4 checks

- [x] Published events expose visibility controls for public, unlisted and private access.
- [x] Hosts can unpublish an event without deleting it.
- [x] Private events direct hosts to personal guest links instead of general-link sharing.
- [x] Manual sharing copy says WhatsApp, SMS and email open for the host to review and send.
- [x] Footer and app navigation no longer point to unavailable beta routes.
- [x] Privacy and terms pages added with beta retention, registry and support language.
- [x] Contact enquiries preserve the full submitted message in the API log.
- [x] Contact requests are stored in a database-backed inbox before logging. Verified 5 October 2026 with `pnpm --filter @wtw/api test` and `pnpm --filter @wtw/api build`. A configured outbound support notification remains an operational enhancement.
- [x] Reminder targeting for pending guests is implemented as a manual review-and-send panel on the Share page, with private events directed to personal links. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`. Automated delivery remains out of MVP scope.

## Follow-up plan checks

- [x] Public header is session-aware and no longer prompts signed-in visitors to sign in again. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`.
- [x] Host next-step guidance allows an undated event with no guest list to publish and share. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`.
- [x] Guest list failures, empty lists and filtered-empty results use distinct states. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`.
- [x] Public invitation service failures show a retryable unavailable state instead of a not-found page. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`.
- [x] Guest optional fields can be intentionally cleared. Verified 5 October 2026 with `pnpm --filter @wtw/api test`, `pnpm --filter @wtw/api build` and `pnpm --filter @wtw/web exec tsc --noEmit`.
- [x] External-only registries count as registry content for public and host preview navigation. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`.
- [ ] Save lifecycle across optional content forms still needs input-preserving field errors and navigation protection.
- [x] Event detail, schedule and RSVP deadline wall times save and reopen in the event timezone. Verified 5 October 2026 with `pnpm --filter @wtw/web exec tsc --noEmit`.
- [x] Shared-link RSVP failure cleanup is implemented so invalid or closed replies do not leave a pending shared-link guest. Verified 5 October 2026 with `pnpm --filter @wtw/api test` and `pnpm --filter @wtw/api build`.
- [ ] Shared-link RSVP retry deduplication after a lost successful response still needs an idempotency design and tests.
- [ ] Private media protection still needs implementation and environment validation.
- [ ] Game close timing and retry-specific guest feedback still need implementation beyond enabled/disabled host controls.
- [ ] Invitation downloads still need QR generation, file visual inspection across devices and private-link policy refinement.

## Verification status

- [x] `pnpm --filter @wtw/shared build`
- [x] `pnpm --filter @wtw/api test`
- [x] `pnpm --filter @wtw/api build`
- [x] `pnpm --filter @wtw/web exec tsc --noEmit`
- [ ] `pnpm --filter @wtw/web lint`, blocked by the existing ESLint 10 and `eslint-plugin-react` compatibility error before changed files are linted.
- [ ] `pnpm --filter @wtw/web build`, blocked by network-restricted Google font fetches from `next/font`.
- [ ] `pnpm --filter @wtw/api test:e2e`, blocked because Postgres is not reachable at `127.0.0.1:5434` in this environment.
