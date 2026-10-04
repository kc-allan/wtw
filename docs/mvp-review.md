# MVP implementation review

Reviewed 4 October 2026. Companion: [completion plan](mvp-completion-plan.md).

The platform has a useful domain foundation, but the primary host-to-guest journey is not yet complete through the website. The highest-value work is connecting creation, editing, personal invitations, and RSVP into a reliable flow. Adding more catalogue entries or dashboard features should follow that work.

## Scope and evidence

Reviewed both supplied PDFs: `Website Structure (Version 2 - MVP).pdf` (which contains Version 2 edits and the earlier Version 1 specification) and `WORTH  THE WAIT.pptx.pdf`, in `/home/lando/Documents/worththewait`. Also reviewed the existing [decision history](open-decisions.md), route inventory, shared celebration definitions, creation and customization flows, event hub, publishing/sharing, guest management, guest page and RSVP, and supporting event, invitation, registry, media, contact and payment services.

This is a source-based product and journey audit, not a visual browser audit or production security assessment. Findings distinguish implemented API capabilities from features an ordinary host can actually use. No application code or infrastructure was changed. Existing unit tests passed: **27 tests across 3 files** via `pnpm test`. The database-backed API journey test was read, not run. No browser journeys, production configuration, payment providers, deployment durability, visual contrast, or device performance were verified.

## Product decisions

The owner confirmed D1-D3 and D5-D7 during this review. D4 is deferred beyond the free beta. The completion plan incorporates these decisions, including gathering-specific invitations as an optional exception rather than the default wedding workflow.

| ID | Conflicting evidence or unresolved choice | Decision/status |
| --- | --- | --- |
| D1 | The written brief excludes registry from birthdays and other simple celebrations. | **Confirmed:** registry only for weddings and baby showers. |
| D2 | Current marketing advertises paid plans while the pitch deck puts Professional later. | **Confirmed:** free beta; paid plans and Professional product work later. Checkout is not an MVP blocker. |
| D3 | Wedding creation currently enables website sections without offering a presentation choice. | **Confirmed:** offer a simple invitation or a wedding website. |
| D4 | Marketing promises payment per celebration, while `Account.plan` grants a workspace-level entitlement and viewer plan can reflect another workspace. | **Deferred:** resolve purchase scope, prices and limits before a later paid release. Not a beta dependency. |
| D5 | Creation explicitly allows an undecided date; the publish UI requires a date, while the API publishes without readiness checks. | **Confirmed:** allow publishing with “Date to be announced.” Do not require a date to go live. |
| D6 | Personal invitation views filter ceremonies, but visitors with a general link see all ceremonies. An empty assignment also means all ceremonies. | **Confirmed:** the general wedding link shows all gatherings with one wedding-wide RSVP. Hosts may optionally invite selected guests to separate gatherings; this is an exception feature, not required setup. |
| D7 | The pitch deck mentions programs and menus; the detailed MVP emphasizes invitations and websites, and includes a downloadable birthday invitation. | **Confirmed:** downloadable invitation images/PDFs in beta; programs and menus later. |

The existing decision to retain third-party themed designs while licensing is investigated remains recorded in `open-decisions.md`. This review does not reverse it. Resolve commercial readiness before those designs are sold or advertised; no legal clearance is inferred from their presence in the repository.

## Findings

Severity uses the audit skill's impact scale: **4** blocks a core task or risks data loss; **3** makes a primary flow unreliable; **2** causes avoidable friction. There are **4 severity-4, 8 severity-3 and 4 severity-2 findings** below. These are source findings, with runtime verification still required before release.

### Severity 4

**F01. The host UI cannot complete the personal invitation-to-RSVP loop.**

The [share panel](../apps/web/app/(app)/events/[id]/share/share-panel.tsx) builds one general URL; its “Personalize per guest” choice changes explanatory text only. The [RSVP form](../apps/web/app/e/[slug]/rsvp-form.tsx) requires an identified guest and invitation token, otherwise telling the guest to ask the hosts for a personal link. The web source has no call to `/invitations/issue`, although [the API service](../apps/api/src/modules/invitations/invitations.service.ts) supports issuing tokens. Adding oneself through `/join` does not return an invitation token or submit an RSVP.

Impact: a host can publish and share successfully, yet their guests cannot reply through that shared link. Principle: task completion and accurate affordances. Complete both the normal shared-link RSVP journey and personal invitation links. The confirmed wedding default uses a general link and one wedding-wide response. Identify new respondents safely and give them a private way to update their reply; a matching name alone must not grant access to an existing response.

**F02. The wedding website cannot be meaningfully authored through the host UI.**

The [customize editor](../apps/web/app/(app)/events/[id]/customize/customize-editor.tsx) edits basic event fields and toggles section visibility. It provides no forms for story entries, timeline, FAQ, dress code, accommodation, registry contents, photo uploads, or RSVP settings. “Your story” saves `event.description`, while the [Our Story renderer](../apps/web/app/e/[slug]/event-sections.tsx) reads `module.config.sections`. Existing shared schemas and renderers are useful foundations, not a complete website builder.

Impact: the flagship promise requires API access to accomplish basic authoring. Principle: user control and task completion. Build focused section editors and match each field to its public destination. D3 confirms that weddings also need an invitation-only mode.

**F03. Saving behavior can cause hosts to lose work.**

The [hub rail](../apps/web/app/(app)/events/[id]/_hub/event-rail.tsx) (line 33) says “Everything saves as you go.” Text changes actually require Save changes; Preview and Publish are independent navigation links. Color swatches change local preview state and explicitly require a trip to the design picker to persist. A successful [save action](../apps/web/lib/event-actions.ts) returns no visible success message. Blank optional fields become omitted values, so clearing an existing venue or description does not reliably clear it on the server.

Impact: hosts can leave believing edits were saved or removed when they were not. Principle: status visibility, error prevention and forgiveness. Establish one save contract, show unsaved/saving/saved/error states, preserve failed submissions, support explicit clearing, and protect navigation from unsaved work.

**F04. Public guest-list submission can overwrite another guest's contact information.**

In [addSelfToGuestList](../apps/api/src/modules/public/public-events.service.ts) (line 135), an unauthenticated submission matches the first existing guest by first name and optional last name, then overwrites email/phone. No proof of ownership is required. Matching by first name alone can also merge unrelated guests. The route checks published status and the join flag, but not the event's private-access rule.

Impact: contact data can be corrupted and invitations misdirected. Principle: error prevention and user control. Stop updating existing contacts based on names alone. Use a personal invitation to edit an existing record, or a distinct pending join request with explicit duplicate review. Apply the agreed event-access policy to this path.

### Severity 3

**F05. Creation confuses the organizer with the person being celebrated and can lose catalogue context.**

[EventBasicsForm](../apps/web/app/(create)/create/event-basics-form.tsx) asks for the organizer's Full Name and, for paired events, their partner. [Draft helpers](../apps/web/lib/create-draft.ts) use those names as the public celebrants regardless of a later “Planner” role. A parent organizing a child's birthday or a planner organizing a wedding can create an event with the wrong names. A fresh `/create?template=...` visit defaults to wedding without resolving the template's event type; changing type does not clear an incompatible theme. The backend rejects mismatched themes, and creation redirects to `?error=1`, which the creation page does not display.

Impact: wrong public identity or an unexplained creation failure. Principle: real-world language and error recovery. Separate account identity, celebrant names and optional “Hosted by”; derive celebration type from a selected design, preserve the chosen design and input, and show a recoverable error.

**F06. Date and location editing does not provide dependable event logistics.**

The [editor](../apps/web/app/(app)/events/[id]/customize/customize-editor.tsx) (line 121) accepts a date but no event time or timezone, while the public page displays a time derived from that value. Editing a timestamp through a date-only input can discard its time. The public [event selection](../apps/api/src/modules/public/public-events.service.ts) (line 32) omits `city` although public components expect it. Complete address and map settings are not exposed in the basic editor. The marketing FAQ says guests see their own timezone, while [display helpers](../apps/web/lib/event-display.ts) deliberately use the event timezone.

Impact: guests may receive an unintended time or incomplete directions. Principle: error prevention and consistency. Treat date, time, timezone and undecided state explicitly; test Nairobi and diaspora views; preserve timestamp information; return the location fields used by the UI. Apply D5: allow undated publishing with “Date to be announced,” without inventing a time or countdown. Align the timezone wording with the implemented display behavior.

**F07. Registry, gallery and baby shower games remain partial journeys.**

Registry CRUD and guest claim APIs exist, but there is no host registry editor. [Guest gifting](../apps/web/app/e/[slug]/gifting-section.tsx) omits external registry links and item purchase URLs; [the page view](../apps/web/app/e/[slug]/event-page-view.tsx) hides a registry containing only external links. Code-only access is accepted when loading a private event but is not forwarded by the [gift claim action](../apps/web/app/e/[slug]/registry-actions.ts). Media upload/list/delete APIs exist with no host upload interface. Games have API routes but no guest renderer/play form or host setup/export UI in the web app.

Impact: marketing and the baby shower/wedding briefs promise features hosts and guests cannot use fully. Principle: completeness and consistency. Finish one vertical journey per retained capability. Keep gift reservations distinct from purchases or payment receipts. Registry remains limited to weddings and baby showers. Include usable wedding gallery authoring in the free beta; paid packaging is later work.

**F08. Paid-plan messaging and enforcement disagree.**

[Pricing content](../apps/web/app/_data/marketing.ts) advertises M-Pesa/card, event and guest limits, premium designs and paid registry. [Billing](../apps/web/app/(app)/account/billing/page.tsx) always says Free. [Payments](../apps/api/src/modules/payments/payments.service.ts) records data but integrates no provider. The signed-in design picker offers premium designs without the marketing catalogue's lock treatment, and [theme resolution](../apps/api/src/modules/themes/themes.service.ts) (line 53) checks type and active status, not purchase entitlement. Module eligibility is type-based; registry is enabled for weddings and baby showers regardless of the Free plan's exclusion.

Impact: the confirmed free beta currently funnels users toward unavailable upgrades and contradictory limits. Principle: consistency and trust. Align the catalogue, editor, billing and marketing with the beta offer; remove inactive purchase prompts. Checkout and paid-entitlement enforcement move to the later commercial release, when D4 must be resolved. Do not use direct database plan changes as the customer journey.

**F09. Publishing and privacy controls do not form a coherent host journey.**

The [publish page](../apps/web/app/(app)/events/[id]/publish/page.tsx) checks design, name and date; [API publishing](../apps/api/src/modules/events/events.service.ts) (line 195) checks ownership and sets published status. There is no corresponding host UI for unpublishing or visibility/access-code management. General links show every wedding gathering, which matches the confirmed default. Optional gathering-specific invitations still need clear scope and a host preview; selecting recipients must not be described as making publicly listed details private. Private-event errors offer no code-entry recovery. Gallery listing does not itself check the gallery module and includes all event images, while stored media URLs are public paths.

Impact: a host cannot confidently control what guests can see or withdraw it through the UI. Principle: control and error prevention. Define readiness and visibility once, enforce access on every relevant endpoint and asset, provide unpublish/recovery controls, and retain the D6 default of a shared programme and one wedding-wide RSVP. Keep gathering-specific invitation controls optional and distinguish invitation targeting from event privacy.

**F10. Invitation lifecycle and status reporting are unreliable.**

[Invitation sending](../apps/api/src/modules/invitations/invitations.service.ts) (line 82) calls a logging sender, shares a tokenless link and records `sent`. Regeneration replaces the token/status but does not reset `revokedAt`, expiry or prior open/response timestamps, so replacing a revoked or expired invitation need not restore access. Raw links are returned only when first minted; later issue calls return `link: null` unless regenerating. The hub counts every non-draft status, including revoked, as “sent”; opening a link on a device does not establish delivery.

Impact: hosts cannot reliably resend links or trust delivery reporting. Principle: system status and recovery. Implement a deliberate reusable-link/reissue policy, test revocation and expiry, and distinguish link created, host-reported sharing, opened, replied and actual provider-confirmed delivery. Do not mark logging as delivery.

**F11. Guest management presents misleading counts and lacks routine corrections.**

The [guest page](../apps/web/app/(app)/events/[id]/guests/page.tsx) labels the number of attending responses “Attending” with “Including N plus ones,” although the value excludes those extra people. Meal aggregates count one selection per responding guest record, not meals for every attendee. “Send reminder” opens the generic share screen, with no pending-guest selection. Host UI supports pasted names, group/status filters, ceremony assignment and CSV export, but lacks editing contact details, party allowances, removal and personal-link actions. RSVP re-entry does not prefill meal/dietary answers because the guest payload omits them.

Impact: hosts can plan with the wrong headcount, struggle to correct mistakes and send the wrong reminder. Principle: real-world meaning and efficiency. Show people attending separately from invitations/replies; expose relevant detail only when collected; preserve replies on edit; make guest corrections and targeted sharing available. D6 confirms one wedding-wide RSVP by default; only hosts using separate gathering invitations should encounter the additional invitation scope and related counts.

**F12. Support and public promises have no dependable completion path.**

The billing upgrade fallback directs users to a contact form, but [ContactService](../apps/api/src/modules/contact/contact.service.ts) only logs name/contact/planning, does not retain the message body and delivers nothing. [Footer links](../apps/web/app/_data/landing.ts) include privacy, terms, contacts, guest experience, professionals, careers and celebration pages absent from the route inventory. The footer says “M-Pesa & Card accepted.” Public copy also promises photos, games, reminders and unpublishing beyond the available UI.

Impact: hosts cannot rely on support or evaluate the actual service. Principle: help, recovery and trust. Connect a monitored support route with full message preservation; fix/remove dead destinations; publish owner-approved service/privacy terms and factual feature copy. No particular legal policy or retention period is assumed here.

### Severity 2

**F13. The interface imposes a wedding workflow on simple celebrations.**

The [hub](../apps/web/app/(app)/events/[id]/page.tsx) always calls the public output Website; the editor always asks for Partner 1/Partner 2 and Your story. The initial progress strip uses the wedding path until a draft exists, even while choosing a different type. The hub starts with “Choose what you want to do first” rather than a useful next action, and a new wedding lands on ceremonies.

Impact: unnecessary choices and uncertainty for a birthday host or first-time couple. Principle: minimalist design and recognition. Use celebration-specific nouns and fields, an accurate short progress indicator and one recommended next task with optional tools nearby.

**F14. Section navigation and preview do not match what the user is editing.**

The hub builds links from enabled modules, even if their content is empty. It uses `gallery` where the guest page renders `moments`, and routes venue links to `ceremonies` even for events with no ceremonies. The public navigation omits several rendered sections, including FAQ and dress code. The host preview has no selected guest, so it cannot demonstrate a personalized RSVP or restricted ceremony view. Optional fetch failures are silently converted to empty content.

Impact: broken jumps, misleading previews and hidden errors. Principle: consistency and visibility. Derive navigation from the rendered content with a shared anchor contract, provide a safe guest-context preview, and show retryable host errors instead of pretending content is absent.

**F15. Design inventory is larger than the finished design experience.**

[Template definitions](../apps/web/app/_data/templates.ts) contain ten explicitly mapped wedding designs; other keys use group/type fallback layouts. These mappings largely vary palette, typography and wording. Many live cards display the theme name as their footer. The brief calls for 10-15 professionally designed wedding templates, which a catalogue row alone does not satisfy. An invitation download path was not found.

Impact: a named design may imply more differentiation than the delivered invitation offers. Principle: expectation matching. Validate a curated launch set visually on real names and phones, keep design names in the picker rather than the guest invitation, and deliver the invitation image/PDF downloads confirmed in D7; defer programs and menus. This finding does not claim to have visually assessed every design.

**F16. Error, empty and mobile states need a dedicated refinement pass.**

Examples: the [guest table](../apps/web/app/(app)/events/[id]/guests/guest-table.tsx) has a minimum width of 860px and uses the same “No guests here yet” message for an empty filtered result; [address collection](../apps/web/app/(app)/events/[id]/_hub/collect-addresses.tsx) offers no close control after opening and suppresses failures; several data-loading routes convert service failures into 404 or empty lists. Public marketing navigation still offers Sign in to an already signed-in host.

Impact: avoidable navigation and recovery friction, especially on a phone. Principle: status, flexibility and forgiveness. Design explicit loading/error/empty/success states, compact guest rows on mobile, a way to close collection, and session-aware navigation. Verify keyboard, screen-reader and responsive behavior in the later browser pass; no visual accessibility certification is claimed.

## Foundations to retain

- Shared type/module definitions already distinguish seven celebration types and avoid duplicating the domain model.
- Guest RSVP uses personal links rather than requiring guest accounts, and the API enforces deadline, party-size and enabled-module rules.
- A host-only draft preview reuses the public renderer, giving the future editor a strong consistency foundation.
- Creation supports an undecided date and a resumable same-browser draft, reducing pressure to know everything immediately.
- Bulk guest entry, filtered export, ceremony assignment and RSVP summaries already have useful implementations.
- Public rendering generally suppresses empty content; the invitation catalogue already has personality descriptions and Kenyan-inspired collections.
- Registry quantity increments have a capacity guard. Add concurrency tests for derived status as well: status currently uses a value read before the guarded update.

## Fast improvements after the decisions are recorded

1. Remove the autosave claim until saving matches it; add explicit save feedback and an unsaved-work warning.
2. Replace inactive personalization/reminder promises with working actions as F01 is completed.
3. Use invitation terminology for simple events and separate organizer/celebrant identity.
4. Show people attending, waiting for reply and only relevant meal information; fix filtered empty states.
5. Make each publication issue link directly to its editor; align section anchors and suppress empty sections.
6. Repair navigation destinations and remove unsupported payment/delivery claims according to D2.

These improve clarity but do not substitute for completing the severity-4 journeys. The [completion plan](mvp-completion-plan.md) sequences the work and defines release evidence.
