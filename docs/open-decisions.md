# Open decisions

## MVP review decisions, 4 October 2026

The owner confirmed the following during the implementation review. These decisions
take precedence over older pricing and packaging descriptions below:

- Registry is available only for weddings and baby showers.
- Launch as a free beta. Paid plans and Professional product tooling come later.
- Weddings offer a choice between a simple invitation and a wedding website.
- Hosts may publish without a date; guests see “Date to be announced.”
- The default wedding link shows all gatherings and collects one RSVP for the wedding.
  Hosts may optionally invite selected guests separately to different gatherings. This
  is an exception feature, not a required setup step or the expected normal workflow.
- Beta includes downloadable invitation images/PDFs. Programs and menus come later.

The [implementation review](mvp-review.md) records the evidence and remaining questions.
The [completion plan](mvp-completion-plan.md) defines the beta journeys, delivery stages
and acceptance criteria. All six product clarification questions are answered. Event
versus account purchase scope is deferred to the later paid release.

## Earlier implementation notes

Things the marketing site is waiting on. Each one names what exists today, the options,
and what it would cost to build.

## Find an Event

A guest who has lost their link has no way back to an invitation. The homepage has a
place for this above the design strip; nothing is built until the behaviour is chosen.

What exists: `GET /public/:slug` resolves one published event, optionally with a guest
token or an access code. There is no search across events.
| Option | What a guest does | What it needs |
| --- | --- | --- |
| Link or code lookup | Pastes their invite link, or types the event code, and lands on the invitation | Nothing new server-side — a form that resolves the slug and redirects |
| Search by name | Types the host's or the event's name and picks from results | A new search endpoint, plus a per-event setting for whether it may be found this way. Published events are currently unlisted by design, so this changes what publishing means |
| Placeholder | Sees the section with the field disabled, or a link to help | Nothing |

Recommendation: link-or-code lookup first. It is useful immediately and does not make
anybody's celebration publicly searchable by accident.

**Done.** `FindEvent` sits above the design strip on the homepage. It takes either the
whole link or the code from it, keeps an invitation token if one came with it, and checks
the event resolves before going anywhere. The destination is always rebuilt from the slug
and the recognised parameters, never from the text, so a pasted foreign link cannot send
anyone off the site. Nothing is searchable by name.

### Previewing before publishing — done

A "preview" during setup used to open `/e/<slug>`, which 404s until the event is
published. `GET /events/:id/preview` now returns the same guest-facing payload for a host
who can manage the event, published or not, and `/events/:id/preview` renders it through
the very component the public page uses. A bar across the top says whether anyone else
can see it yet. The Customize step and the hub's page list both point there while an
event is a draft, and at the live address once it is published.

## What "Premium" means to a customer

The browse grid marks some designs Premium with no explanation of what that gets them.
The plans page treats it as a real commercial tier: Free lists "3 starter templates" and
excludes "Premium templates"; Celebration includes "All templates, all styles".

Left exactly as it is for now. The choice is between:

- keeping the tier and making the badge say so — "Included with the Celebration plan",
  linked to `/plans` — so the label sells rather than puzzles; or
- dropping the badge from browsing entirely and letting the upgrade appear at checkout,
  which means rewriting the Free plan's feature list to match.

My recommendation is to replace the badge with a golden star at the top right of the card. The "Personalize invitation" text should the read "Included with the Celebration plan" with an "Upgrade" link to its right and a lock icon to the left. The card should generally look disabled to users not in that plan. Actually each "premium" card should be disabled to users not in that plan and the star icon should have different colors depending on the plan.

**Done**, with one thing still open. The badge is gone; a star sits at the top right of
every design kept for paying hosts, its colour keyed to the plan that includes it. A
reader whose plan does not include the design sees the artwork dimmed and, in place of
the action, a lock, "Included with the Celebration plan" and an Upgrade link to `/plans`.

To know who is on what, `Account.plan` now exists (`free`, `celebration`, `professional`,
everyone free) and `GET /auth/me` reports the most generous plan among the workspaces a
host belongs to — so being added to somebody else's workspace never costs them what they
already had. Signed-out readers count as free. Nothing moves an account off free yet
because there is no way to pay; until then it is set directly:

```sql
UPDATE accounts SET plan = 'celebration' WHERE id = '<account id>';
```

Still open: **the catalogue only knows premium or not.** `Theme.isPremium` is a boolean,
so today every paid design maps to the Celebration plan and only that star colour is ever
drawn. Giving designs a tier of their own — so some could be Professional — means a
`tier` column on `Theme` and a pass over all 119 seeded designs. The colour is already a
function of the plan, so that is a data change rather than a UI one.

## Commercial licensing of third-party designs

A little over a quarter of the catalogue is built on characters, names and marks owned by
other companies. The copy in `apps/web/app/_data/invitation-copy.ts` deliberately
describes the party rather than the character, so the marketing words are not themselves
the exposure — but the designs and their names still need clearing for commercial use
before any of this is sold or advertised.

Affected catalogue keys:

```
birthday-avengers            birthday-barbie              birthday-batman
birthday-bluey               birthday-cars                birthday-disney-princess
birthday-encanto             birthday-frozen              birthday-hello-kitty
birthday-hot-wheels          birthday-minnie-mouse        birthday-moana
birthday-paw-patrol          birthday-peppa-pig           birthday-sonic
birthday-spider-man          birthday-super-mario         birthday-superman
birthday-tiktok
```

If the answer on any of them is no, they need removing from `seedThemes` in
`apps/api/prisma/seed-data/themes.ts` along with their entry in `invitation-copy.ts`.

Recommendation: Keep them as is as we figure out the licensing. The designs are already in the catalogue and the copy is written to keep track once we figure out how to go about it

**No change made.** Left exactly as it is, per the above. The list of affected keys stays
here so it can be worked through when the answer comes back.

## Smaller ones

- **Baby shower sections** still stack as three lists (Baby girl, Baby boy, Modern
  luxury). Birthdays now gather their kids designs into one section with a filter; the
  same treatment is available here if it reads better.
- **Sample details.** Cards fall back to one sample name per celebration until a visitor
  types their own. Varying the fallback by section is a small change if the repetition
  still shows.
- **The signed-in builder** still calls the step "Template" while the public site says
  invitations and designs. Worth aligning when the builder is next touched.
- **Vendor prices have no unit.** Cards read "Ksh 150,000 to start" because `priceFrom`
  is the lowest a vendor quotes and nothing records what it buys. The designs say
  "/ day", which needs a unit on the vendor profile — per day, per head, per event.
- **Vendors cannot be filtered by date or capacity.** The design offers "Filter venue by
  date, no. of guests"; the directory filters by place instead, because no vendor record
  holds availability or a guest ceiling.
