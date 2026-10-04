# MVP completion plan

Prepared 4 October 2026. Evidence and finding IDs: [implementation review](mvp-review.md). Existing decisions remain in [open-decisions.md](open-decisions.md).

**Status: free-beta completion plan.** The owner confirmed registries only for weddings and baby showers, paid plans later, and a choice of simple invitation or wedding website. The owner also confirmed undated publishing, one wedding-wide RSVP with optional gathering-specific invitations, and invitation image/PDF downloads. D4 concerns a later paid release. No application implementation changes are included in this review.

## MVP outcome

A host can create the right kind of celebration, personalize its public page, preview it accurately, publish, invite friends and manage their replies without developer help. A guest can understand who/what/when/where, respond on a phone without an account, revisit their response and use any optional gifting or wedding information relevant to them.

The host should see a small set of meaningful tasks, not the full list of platform capabilities. A couple building a wedding website gets deeper authoring tools; an ordinary invitation stays short. Optional content should remain optional, with no empty public sections or mandatory completion of nonessential steps.

## Scope contract

| Area | Beta scope | Boundaries |
| --- | --- | --- |
| Celebration types | Retain the seven implemented types and their shared engine. Test each creation path. | D1 confirmed: registry only for weddings and baby showers. |
| Wedding website | Finish story, gallery, schedule, maps, dress code, FAQ, registry and optional accommodation authoring. | D3 confirmed: an explicit invitation/website choice. Recommend reversible switching with saved content retained. |
| Simple invitations | Short event details, RSVP and sharing; concise optional information where supported. | Wedding invitations and baby showers may offer registry. Birthdays, graduations, anniversaries, bridal showers and corporate invitations do not. |
| Baby showers | Complete registry and a usable games journey because both appear in the detailed MVP brief. | Any reduction in game scope must be agreed, not silently treated as later work. |
| Free beta | Accurate beta copy and consistent access to the agreed launch capabilities. | D2 confirmed: no checkout, paid upgrades or Professional tooling in MVP. Resolve D4 for the later commercial release. |
| Publishing | One readiness policy, preview, sharing and unpublish controls. | D5 confirmed: allow “Date to be announced.” D6 confirmed: general wedding link shows all gatherings with one RSVP; separate gathering invitations are optional exceptions. |
| Design outputs | Curated, reviewed designs and correct guest-facing invitation content. | D7 confirmed: downloadable invitation images/PDFs; programs and menus later. |
| Vendors | Review the existing directory against the brief's eight categories; verify real content, multiple event-type tagging and working contact links. Keep discovery secondary to creation. | No vendor booking, availability management or vendor SaaS is assumed. |

Do not infer prices, quotas, permanent hosting or a complete premium-design offer from existing marketing text. Wedding gallery authoring belongs in the beta website experience. Confirm the curated beta design set and operational limits without turning the old paid-plan copy into requirements. Record further answers in the dated decision entry before implementing affected behavior.

### Beta capability matrix

This is the proposed screen composition within the confirmed product boundaries. “Optional” means the host chooses whether guests see the feature; it does not imply a paid upgrade. Never render empty sections just because a capability is available.

| Celebration/presentation | Essential host tools | Optional guest content | Excluded from this presentation |
| --- | --- | --- | --- |
| Wedding invitation | Couple's names, design, date/time/place, RSVP, guests and sharing | Registry and concise practical details; separate gathering invitations only when requested by the host | Story/gallery website builder and long website navigation |
| Wedding website | All invitation tools plus focused website content editor | Story, photos, registry, schedule, FAQ, dress code and accommodation | Professional workspace tools and checkout |
| Baby shower | Celebrant/event details, design, RSVP, guests and sharing | Registry and games, accessible directly from the invitation | Wedding story, ceremonies and full website builder |
| Birthday | Birthday person's name, optional age, event details, design, RSVP, guests and sharing | Short event note and directions | Registry, gallery, couple fields and full website builder |
| Graduation | Graduate/event name, event details, design, RSVP, guests and sharing | Short event note and directions | Registry, gallery and wedding tools |
| Anniversary | Celebrant names, event details, design, RSVP, guests and sharing | Short event note and directions | Registry, gallery and wedding website builder |
| Bridal shower | Celebrant name, event details, design, RSVP, guests and sharing | Short event note and directions | Registry, gallery and wedding website builder |
| Corporate | Event/organization name, event details, design, RSVP, guests and sharing | Host contact and concise practical information | Registry, romantic copy, couple fields and Professional subscription tools |

## Audience and information rules

| Audience or state | Lead with | Offer when relevant | Keep out of the main flow |
| --- | --- | --- | --- |
| New visitor | Choose a celebration or browse designs; a separate Find an event route for guests | Plain distinction between a wedding website and an invitation; clear free-beta offer | Professional dashboard concepts, module terminology, a wall of feature comparisons |
| New simple-event host | Celebrant/event name, date or undecided, location, design | RSVP options; optional registry only for wedding invitations and baby showers | Irrelevant couple fields, Our Story and website navigation management |
| Couple using a wedding website | Names, design, essential day details, live preview | Story, photos, dress code, schedule, FAQ, gifts, accommodation | A requirement to finish every section before inviting anyone |
| Parent, friend or organizer | Who the celebration is for; optional Hosted by | Organizer's contact information in account settings | Assuming the account owner is the birthday child or one of the couple |
| Returning draft host | Event title, Saved status and the next unfinished essential task | All other editing tasks through short navigation | Repeating onboarding, upgrade prompts competing with completion |
| Published-event host | People attending, waiting for reply, share invitation and edit details | Meals, export and reminders; gathering-specific information only when the host uses separate invitations | Empty charts, irrelevant fields, delivery claims based on device-share clicks |
| Invited guest | Invitation, date/time/place and Reply | The wedding programme, directions, optional gifting and practical information; selected gatherings for a separate invitation | Host navigation, billing, guest-list data, account signup and product sales prompts |
| Guest who already replied | Their saved answer and Change my reply when allowed | Date/location updates and directions | Repeating the entire form without their saved answers |
| Guest with an unusable link | Clear explanation and a useful next step | Access-code entry or host contact where supported | Technical token errors, misleading event-not-found responses for service outages |
| Past-event host | Final attendance, export and gallery/keepsake options if included | Archive/unpublish and retention information | A pending-guest reminder as the default action |
| Planner helping with one event | The same organizer-aware event flow | Access to explicitly authorized events | An assumption that choosing Planner subscribes them to Professional |

## Target journeys

**Simple celebration:** choose type or design → name the celebration/celebrant → save a draft to an account → edit date, time, location and invitation → review RSVP settings → preview → publish → share working links → manage replies. Date and optional details may be deferred, including after publishing; show “Date to be announced” until a date is set. Preserve the entry-point design and all completed inputs through sign-in, validation errors and back navigation.

**Wedding:** choose wedding → choose “Invitation” or “Wedding website” → enter the couple's names → choose a design → save draft → complete essential day details → optionally add gatherings and relevant content → preview as a guest → publish → invite → manage responses. Explain the choice in one sentence per option: “A simple page with your details and RSVP” and “A website for your story, photos and wedding details.” Offer registry in either wedding presentation. Website sections stay out of the invitation editor. Use one shared programme and one wedding-wide RSVP by default. Put “Invite separately to a gathering” under optional guest/invitation settings; do not require guest assignments or per-gathering response forms during normal setup. Put role and gathering questions where they affect the flow; do not force a separate role screen merely to collect a label. Each optional website section has Add, Edit, Preview and Hide actions. Hide should preserve saved content unless the host explicitly deletes it.

**Returning host:** open the event → see “Your invitation is ready to share” or a specific next task such as “Add the time” → do that task → get explicit saved feedback. Keep Design, Details, Guests and Share predictable; expose Website content only where appropriate. Prefer one primary action per screen.

**Invited guest:** open the shared wedding link or a personal invitation → see the programme or the gatherings named in that separate invitation → choose attending/not attending, with Maybe only if enabled → answer only relevant party/meal questions → submit → see saved response and how to change it. RSVP precedes gifting. Closed RSVP, revoked links and capacity limits should provide a practical next step without requiring an account.

**General-link visitor:** open the wedding programme → enter their name and respond once for the wedding → receive confirmation and a private return link for changes. Identify/create a distinct guest safely; do not reuse a matching name as proof of identity or overwrite another guest's details. Existing invited guests may use their personal link to keep their existing record. Contact collection remains a separate host tool and must not imply attendance has been confirmed.

**Separate gathering invitation:** a host explicitly chooses “Invite separately to a gathering,” selects the gathering(s) and recipients, then previews and shares their invitation. Keep this within the same wedding, preserve each invitation's scope, and avoid overwriting the wedding-wide response when a separate invitation is answered. Proposed implementation: one response per invitation scope, without making every guest answer a gathering-by-gathering form. The normal general link still shows the wedding programme; selected recipients do not automatically make publicly listed gathering details private.

## Delivery sequence

Stages are ordered by dependency and user value, not speculative calendar dates. Estimate after a short implementation breakdown of this confirmed beta scope; no team size or delivery capacity has been assumed. A stage completes only when its acceptance conditions work through the UI as well as the API.

### Stage 0: settle scope and establish the release checklist

**Owner:** product owner with engineering. **Dependencies:** none. **Findings:** F08, F09, F12, F15.

- Record confirmed D1-D3 and D5-D7 in the release checklist. D4 is not a beta dependency.
- Write one table of beta capabilities and defaults by celebration type and chosen presentation. Apply through shared contracts, not duplicated UI decisions; leave paid entitlements for the later release.
- Implement the shared wedding link and single RSVP default. Use manual WhatsApp/SMS/email sharing for the beta; confirm the operational support owner. Automated delivery is a later enhancement unless separately approved.
- Include wedding gallery authoring; keep separate gathering invitations optional; refine birthday age/name fields and the curated beta design list. Retain the existing licensing decision until its owner revises it.
- Replace roadmap claims with a factual release checklist. Keep a decision log so later sessions do not reintroduce old assumptions.

**Exit:** approved answers and an agreed MVP feature matrix; remaining unknowns explicitly exclude only their dependent work, not the common core.

### Stage 1: complete one reliable invitation and RSVP journey

**Owner:** full-stack engineering. **Dependencies:** confirmed D5/D6 and existing event/guest APIs. **Findings:** F01, F04, F06, F09-F11.

- Create one birthday and one wedding with an existing design; repair template/type propagation and show creation failures with preserved inputs.
- Add explicit date/time/timezone and full location controls. Align public payloads and stored event details. Support deliberate clearing and allow publishing without a date. Show “Date to be announced,” omit unavailable time/countdown/calendar actions, and preserve RSVP settings independently from whether a date is known.
- Complete the general-link RSVP path with safe respondent creation and private return links. Do not force hosts to assign guests to gatherings or issue individual invitations to collect wedding-wide replies.
- Add guest contact, party allowance, edit/remove actions and an actual “Share invitation” action per guest. Bulk selection can follow the single-guest success path.
- Connect invitation issuance to the UI. Define how a host retrieves/shares a link later without silently invalidating links already sent. If replacement is necessary, explain the effect, reset lifecycle fields and test expired/revoked links.
- Remove name-only contact overwrites. Make join/registration obey the agreed visibility policy.
- Make RSVP confirmation and update reliable, retain all prior answers, show deadline/closed states before submission, and report people versus replies correctly.
- Share the actual guest URL through the chosen channel. Record only observable statuses; disable production use of a logging sender as if it delivered messages.

**Exit:** on a phone, a host creates and publishes both dated and undated events, then shares a general wedding link or a personal invitation; the guest replies and changes their answer; the host sees correct attendance and export. Same-name guests remain distinct. Reopening the host's guest list permits intentional resharing. No API console or database edit is needed.

### Stage 2: make editing and navigation match the celebration

**Owner:** product/design and frontend engineering. **Dependencies:** Stage 0 presentation rules, Stage 1 save/data contracts. **Findings:** F03, F05, F13, F14, F16.

- Separate organizer/account names from celebrants. Use “Birthday person's name,” “Couple's names,” “Celebration name” or similarly appropriate labels, with optional Hosted by.
- Preserve selected type/design and valid progress across navigation. Keep the progress indicator in sync with the actual flow. Remove “you can change it later” for event type unless conversion is supported safely.
- Replace the open-ended hub with event context, saved state and a recommended next essential task. Use “Invitation” for simple celebrations and “Wedding website” for the full wedding experience.
- Persist the wedding presentation choice separately from celebration type. Recommended: allow switching presentation without deleting content, with a preview and confirmation of what becomes visible before changing a live page.
- Implement a consistent save strategy. Recommendation: explicit Save changes with visible unsaved/saving/saved/error states and navigation protection for MVP; autosave can follow if it earns its complexity. Preview and Publish must use confirmed saved values or offer Save and continue.
- Save design changes from the place they are made. Show a useful preview of the actual content, not only a card with partially updated fields.
- Drive editor navigation, public navigation and preview anchors from the same content rules. Add a non-mutating preview for a selected guest and their gatherings.
- Handle loading, unavailable service, empty result, invalid input, retry and success intentionally. Present compact mobile guest rows with expandable detail.

**Exit:** parent, couple and corporate organizer flows use correct names and vocabulary; a non-wedding invitation has no wedding-only fields; a host can leave/reopen without losing confirmed work; preview matches the public result. Optional sections do not compete with the primary task.

### Stage 3: finish the promised content capabilities

**Owner:** full-stack engineering with design/content. **Dependencies:** Stage 2 editor/save pattern; confirmed D1/D3/D6/D7. **Findings:** F02, F07, F09, F14, F15.

| Capability | Smallest complete slice | Acceptance |
| --- | --- | --- |
| Wedding story | Add/edit/remove story entries and photos where supported | Content written under Our Story appears there in preview and the live website; no unintended duplicate description |
| Schedule and gatherings | Shared wedding programme and single RSVP; optional separate invitations for selected gatherings/guests | Normal creation/sharing needs no assignments; separate invitation scope is clear in host preview, guest reply and export; answering one scope does not overwrite another |
| Practical information | FAQ, dress code with named colors, maps/directions, optional accommodation links | Host can author and hide each section; guests can navigate directly and open useful directions |
| Registry | Host items, quantities, purchase URLs, external registries and optional cash instructions; guest reserve flow | External-only registries render; purchase links work; private access survives claims; duplicate retries and competing claims cannot inflate reservations; cancellation/correction has an intentional path |
| Gallery | Host upload, preview, arrange and delete; captions/alternative text; public display | Photos persist through restart/deploy in the chosen environment; only intended images are published; private access and disabled galleries are respected |
| Baby shower games | Host creates supported games; guest submits; host sees/exports answers | A usable end-to-end game for each retained supported format; closed games, invalid answers, retry/duplicate submissions and answer-key visibility tested |
| RSVP settings | Deadline, allowed responses, plus-ones, party limit, optional meals/dietary/message fields | Form and validation agree; irrelevant fields are hidden; hosts can understand totals |
| Designs and download | Curated launch designs; downloadable invitation images and PDFs | Downloads match saved content, fit long names, show the date or “Date to be announced,” retain essential location details and a usable RSVP link/QR code, and exclude unrelated guest information; no programs or menus in beta |

Keep guest-upload galleries, a general drag-and-drop page builder and extra design volume out of this stage unless separately approved. The MVP needs focused customization; an unrestricted site builder is a separate expansion. Baby shower games and invitation downloads are in scope; any future deferral requires an explicit scope change. Programs and menus are deferred.

### Stage 4: publishing, communications and beta readiness

**Owner:** engineering, product/content and operations. **Dependencies:** confirmed free-beta scope and completed core journeys. **Findings:** F08-F12, F16.

- Enforce the same publication checklist in the API and UI. An undecided date is allowed and must not block publishing; optional suggestions remain dismissible and link directly to the relevant editor.
- Provide unpublish, visibility and intentional post-event controls. Explain who can open the link before sharing. Keep public media and private ceremony behavior consistent with those choices.
- Add reminders targeted to guests still awaiting a reply, with reviewable message text. For manual sharing, say that the user's messaging app opens; do not imply confirmed delivery. Avoid automated campaign work unless explicitly in scope.
- Route contact requests to a monitored destination, preserve the full message, expose failure/retry, and confirm receipt only after durable acceptance.
- Repair or remove every broken navigation destination. Publish approved privacy/service information and a practical retention/deletion/support policy. Verify actual vendor content and contact paths; do not add booking claims to a directory.
- Align public origin settings so preview, personal links, general links and marketing examples use the deployed address consistently.
- Audit every promise in pricing, FAQs, about, footer and onboarding against a working journey. Verify testimonials and public claims with the owner before launch.

Publish a clear free-beta offer, use the agreed beta capability set, hide inactive upgrade paths and payment-accepted claims, and replace irrelevant billing navigation with useful account information. Make the curated beta designs selectable consistently in discovery and the editor. Do not impose invented limits or grant the entire existing premium catalogue without an explicit product choice.

**Exit:** every advertised beta action works or is clearly unavailable before commitment; sharing statuses are truthful; a host can get support and withdraw their event; no part of the beta journey requires an unavailable purchase.

### Stage 5: prove release readiness with real journeys

**Owner:** engineering/QA, design and product owner. **Dependencies:** all in-scope stages above.

- Add focused API tests for personal links, reissue/revocation/expiry, same-name guests, cross-event access, RSVP updates/deadlines/limits, undated publication, default wedding-wide replies, independent responses to separate gathering invitations, registry concurrency/status, and optional-module access. Use a dedicated test database for integration tests.
- Add browser journeys for creation through sharing and guest response, wedding content authoring, parent-organized birthday, baby shower games/gifting, returning to a saved draft, undated publishing, optional separate gathering invitations, and invitation image/PDF downloads. Cover all other launch types with lightweight smoke journeys.
- Include failure cases: save failure, slow connection, stale response, expired session, empty catalogue, unavailable API, duplicate submit, private link without credentials and closed RSVP. Confirm recovery retains useful input. Assess account recovery; no password-recovery page was found in the route inventory.
- Check narrow mobile screens, in-app sharing/browser transitions, keyboard navigation, focus, errors announced to assistive technology, reduced motion, zoom, readable type and contrast across launch designs. Capture screenshots for the editor, invitation and RSVP at representative widths.
- Verify production configuration, media persistence and private delivery, upload limits/content checks, database/media backup and restore, monitoring for failed creation/publish/RSVP, and a release rollback path. Local disk is not inherently disallowed, but durability and access rules must be demonstrated. Obtain approval before any destructive infrastructure operation.
- Run a small moderated trial with a couple, a non-wedding organizer and guests of differing phone familiarity. Observe where they hesitate; revise the flow before expanding features.

**Release gate:** no open severity-4 findings; every retained MVP capability passes its complete user journey; remaining severity-3 findings have an explicit product-owner disposition. Keep a dated checklist of tested environment, result and remaining limitations.

## Deferred commercial work

Paid plans and Professional tooling are outside the confirmed beta scope. Before a paid release, resolve D4, prices and quotas; add provider checkout, verified payment notifications, retry/idempotency, receipts, recovery and consistent event/account entitlements. Keep platform purchases separate from host-provided gift payment instructions. Before Professional launch, define client ownership, workspace selection, teammate invitations and permission boundaries, branding and subscription lifecycle. Existing account membership and a Planner onboarding option do not constitute this product.

## Communication tone and copy contract

Use warm, calm, direct language. Let the celebration supply the emotion. Describe what happens next and state what is saved, visible or optional. Prefer familiar nouns: invitation, wedding website, guests, reply, gifts, photos. Technical terms such as module, entitlement and token belong in developer documentation, not the host or guest interface. Avoid em dashes in application content.

| Situation | Suggested content | Show to |
| --- | --- | --- |
| Simple-event setup | “Who are you celebrating?” or “What is your event called?” | Appropriate organizer; choose the question by celebration type |
| Optional section | “Add your story” / “You can add this later.” | Couple building a website |
| Unsaved work | “You have unsaved changes.” with Save and continue / Keep editing | Host leaving edited content |
| Save complete | “Changes saved.” | Editing host, after confirmed success |
| Date undecided | “Date to be announced.” | Guests viewing an undated event or downloaded invitation |
| Optional date reminder | “You can add the date when it is confirmed.” | Host publishing without a date; never a blocking error |
| Separate gathering invitations | “Invite separately to a gathering” | Host opening optional invitation settings; absent from required onboarding |
| Published | “Your invitation is ready to share.” | Simple-event host; use “wedding website” for that presentation |
| Manual WhatsApp sharing | “Share on WhatsApp” / “Choose who to send it to in WhatsApp.” | Host, with the appropriate real link |
| Guest reply choices | “I'll be there” / “I can't make it” / “Not sure yet” when allowed | Guests; an intentionally formal wedding variation may be offered |
| Response complete | “Thanks, Amina. Your reply has been saved.” with Change my reply when permitted | Identified guest |
| Deadline passed | “Replies have closed. Contact the hosts if your plans have changed.” | Guest, with an approved contact path where available |
| Gift reserved | “Reserved for you. Use the shop link to buy the gift.” | Guest reserving an item; never imply that money was taken |
| Cash instructions | “Send your gift using the details below.” | Guest viewing host-provided instructions |
| Empty guest list | “Add your first guest to send a personal invitation.” | Host with no guests |
| Filter with no results | “No guests match these filters.” with Clear filters | Host searching an existing list |
| Pending responses | “12 guests haven't replied yet.” with Review reminders | Published-event host, once targeting works |
| Optional registry | “Gifts are optional.” if approved by the host | Guest viewing gifting; never make a gift a prerequisite to RSVP |

Use personalization only when identity is known. Do not call someone a bride, groom, parent or planner merely because of the event type. State the event timezone beside the time; add a guest-local conversion only if that behavior is intentionally supported. Do not promise “any time,” “instant,” “delivered,” “unlimited,” or permanent keepsakes unless the corresponding rules and operations support it.

## Measuring whether the flow is simpler

Track completion and hesitation, not just visits. Suggested trial criteria are proposals, not claims about current performance:

- A first-time simple-event host can produce and share an invitation without assistance, ideally within five minutes when details are ready.
- A guest can find the date/place and submit a basic response in about one minute, with no account and no required gift interaction.
- A couple can publish the essentials without filling every optional website section.
- Hosts can correctly explain whether changes are saved, whether the page is live, and whether a link has actually been sent.
- Measure drop-off at creation, account save, editor, publish, sharing and RSVP; collect recovery failures separately from voluntary exits.
- Avoid logging private invitation links, guest messages or unnecessary personal data in product analytics.

After those outcomes are met, prioritize further work from observed friction. Professional tooling, vendor SaaS, advanced analytics, referral systems and a larger design marketplace remain later-phase candidates unless the owner explicitly includes them in the release scope.
