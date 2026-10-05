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

## Verification status

- [x] `pnpm --filter @wtw/shared build`
- [x] `pnpm --filter @wtw/api test`
- [x] `pnpm --filter @wtw/api build`
- [x] `pnpm --filter @wtw/web exec tsc --noEmit`
- [ ] `pnpm --filter @wtw/web lint`, blocked by the existing ESLint 10 and `eslint-plugin-react` compatibility error before changed files are linted.
- [ ] `pnpm --filter @wtw/web build`, blocked by network-restricted Google font fetches from `next/font`.
- [ ] `pnpm --filter @wtw/api test:e2e`, blocked because Postgres is not reachable at `127.0.0.1:5434` in this environment.
