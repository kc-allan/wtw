# Invitation designs

Fourteen landing-page designs are mapped to existing catalogue keys across seven celebration categories. Other catalogue entries retain their current renderer. This is a curated expansion, not a conversion of the entire catalogue.

| Design | Catalogue key | Composition | Sample |
| --- | --- | --- | --- |
| Coastal | `wedding-coastal-diani-and-lamu` | Destination journal: a couple's monogram, open horizon, numbered editorial chapters and a horizontal itinerary | `/designs/coastal` |
| Garden Wedding | `wedding-garden-wedding` | Botanical correspondence: painted wildflowers, stacked names, recurring sprigs, a fine-stem programme and an intimate reply section | `/designs/garden` |
| Black Tie | `wedding-black-tie` | Formal programme, sculptural lilies and fine double rules | `/designs/blacktie` |
| Tropical Greenery | `wedding-tropical-greenery` | Botanical folio, photographic canopy and open-air chapters | `/designs/tropical` |
| Modern Monochrome | `wedding-modern-monochrome` | Art-book cover, oversized sans-serif names and editorial story columns | `/designs/monochrome` |
| Brunch Party | `birthday-brunch-party` | Bistro invitation: painted tableware, picnic checks, double rules and a place-at-the-table reply | `/designs/brunch` |
| Space Explorer | `birthday-space-explorer` | Paper-cut rocket landscape, flight-log details and a launch clock | `/designs/space` |
| Neon Party | `birthday-neon-party` | Music-poster lettering, concert photography, ticket rules and an acid-yellow countdown | `/designs/neon` |
| Blue Sky | `baby-shower-blue-sky` | Cloud-blue correspondence, fine rules and a centered, airy invitation | `/designs/sky` |
| Little Explorer | `baby-shower-little-explorer` | Watercolor storybook landscape, dotted trails and gathering-place notes | `/designs/explorer` |
| Academic Excellence | `graduation-academic-excellence` | Literary broadside, library photography and bookish chapter rules | `/designs/scholar` |
| Romantic Floral | `anniversary-romantic-floral` | Floral love letter, keepsake borders and tender serif type | `/designs/heirloom` |
| Champagne & Roses | `bridal-shower-champagne-and-roses` | Rose-pink salon, ribbon stripes and a toast-ready reply | `/designs/roses` |
| Conference | `corporate-conference` | Architectural signage, clear arrival columns and a focused attendance form | `/designs/conference` |

## Category rollout

- Weddings: five designs delivered. Next: White & Gold, Ivory & Champagne, then the remaining luxury, nature and Kenyan-inspired entries.
- Birthdays: three designs delivered. Next: adult evening and milestone invitations, followed by distinct children's and teen themes.
- Baby showers: two designs delivered. Next: Floral Garden, Busy Bee and the calm contemporary collection.
- Graduations, anniversaries, bridal showers and corporate: one starting design each; remaining catalogue entries are still pending.

Public stock assets are appropriate when they carry the visual idea. Character-based entries need suitable artwork, not unrelated photographs or misleading substitutes.

## Sample fidelity

The preview selector groups designs by celebration. `invitation-samples.ts` keeps illustrative event data separate from production rendering. Only wedding previews include story, dress code and structured programme modules, matching the current event-type registry. Other categories use details, arrival information, countdown and RSVP. The earlier Brunch sample's unsupported schedule has been removed. No event-type permissions or backend capabilities were expanded.

Baby-shower registries and games remain supported by the existing public renderer, but this sample collection does not populate them. Preview RSVP submissions remain disabled. Guest-page navigation stays short and functional even when section headings have a thematic tone.

## Design direction

The collection takes inspiration from the coordinated website and stationery families in [Joy's design catalogue](https://withjoy.com/designs/) and [The Knot's website catalogue](https://www.theknot.com/gs/wedding-websites/designs). Their artwork is not copied or bundled here.

Each design needs a composition system that survives scrolling past the opening image. Coastal uses editorial chapter markers and asymmetric text columns; Garden uses centered correspondence, fine botanical marks and a vertical programme; Brunch uses menu rules, cheerful still-life illustration and conversational language. Sections keep their own layouts on small screens instead of shrinking a desktop invitation card.

Future designs must specify their opening, details, optional content, reply treatment and compact preview together. A replacement hero image is not a new template. Optional modules still come from the host's saved configuration; no sample story, menu or itinerary is injected into a real celebration.

## Accent contract

`invitation.config.accentColor` stores an optional six-digit hex color through the existing module API. It does not change the event's `themeKey`. Each new design owns its fixed base palette, artwork, composition and typography. Accent changes apply to selected headings, rules, links, buttons and form selection states. Existing events without this field use the design default. The host editor saves color separately from event details and reports its own pending/success/error state.

The public renderer and host preview use the same definition. Catalogue cards are compact previews; they are not the guest-facing output. The public sample routes render illustrative event data with RSVP submission disabled. Actual event pages use saved event details and the existing RSVP, registry, game and gallery flows.

## Extending the collection

1. Give each design a distinct occasion, composition and visual idea before choosing colors. A palette change alone is not a new design.
2. Register its catalogue key, fixed base palette, artwork and reviewed accents in `apps/web/lib/invitation-designs.ts`.
3. Implement its hero and section treatment in the invitation components. Keep event facts, optional-section rules and guest actions in the shared renderer.
4. Use real saved names, dates and locations. Artwork is thematic decoration, not a representation of the host's actual venue or guests. Avoid hard-coded event facts in templates.
5. Keep type sizes bounded, long names wrappable, directions usable and RSVP reachable. Hide unavailable/empty sections. Validate each accent against both the base and artwork.
6. Check full pages and thumbnails on phones and desktop, plus undated events, long names and keyboard interaction. Verify accent selection leaves artwork, base colors and template identity unchanged.

## Assets

- `coast.png`: generated coastal artwork inspired by the Kenyan Indian Ocean coastline; not a photograph of a named venue.
- `garden.png`: generated watercolor botanical illustration.
- `brunch-table.png`: original generated gouache tableware illustration with transparency.
- `garden-sprig.png`: original generated botanical watercolor with transparency.

The two supporting illustrations were generated with the built-in image tool and are stored under `apps/web/public/images/invitations/`.

New assets are also stored locally in that directory, with responsive delivery through Next Image:

- `calla.jpg`: [Don Ricardo, Unsplash](https://unsplash.com/photos/bbf1teuiDbo).
- `palms.jpg`: [vickholius nugroho, Unsplash](https://unsplash.com/photos/jt6QxZwSOCQ).
- `peonies.jpg`: [Peter Bucks, Unsplash](https://unsplash.com/photos/hY4TcvzyPlw).
- `sky.jpg`: [Daniel Scicchitano, Unsplash](https://unsplash.com/photos/9dhTS8tppJ4).
- `architecture.jpg`: [Eric Gonzalez, Unsplash](https://unsplash.com/photos/IguguQbSomE).
- `stage.jpg`: [Unsplash concert source](https://images.unsplash.com/photo-1514525253161-7a46d19cd819).
- `library.jpg`: [Unsplash library source](https://images.unsplash.com/photo-1507842217343-583bb7270b66).
- `space.png` and `explorer.jpg`: original illustrations generated with the built-in image tool. The opaque Explorer illustration is served from a compressed JPEG. These are decorative scenes, not actual venues.

### Illustration prompts

Brunch table:

> Use case: illustration-story. Create an original editorial gouache illustration for a cheerful birthday brunch invitation website. A loose artful tabletop still life: tomato-red scalloped plate with croissant, cobalt blue coffee cup, slender green vase with two coral flowers, little dish of strawberries, striped yellow napkin. Charming hand-painted imperfect outlines, sophisticated French bistro menu illustration, flat opaque paint with subtle brush texture. Wide balanced composition, all objects fully visible, generous transparent negative space around objects. No table rectangle, no lettering, no text, no border, no shadow background. Transparent background.

Garden sprig:

> Use case: illustration-story. Original botanical watercolor illustration for wedding stationery, isolated on transparent background. One gracefully curved loose stem of a coral-pink cosmos flower with two smaller dusty-blue wildflowers and fine sage-green leaves, delicately hand painted, elegant natural asymmetry. Whole sprig fully visible in tall portrait composition with generous empty space, no vase, no text, no frame, no background or shadow. Fine botanical ink details, muted but clearly visible pigment.

### Additional illustration prompts

Space Explorer:

> Original paper-cut illustration for a child's space birthday invitation, panoramic landscape 1536x1024. In the bottom third a toy-like red and white rocket launches diagonally from a pale grey cratered moon, Saturn ochre at far left, small teal planet far right, tiny four-point navy stars. Layered tactile cut-paper shapes, sophisticated children's book art, playful but not babyish. Upper two thirds clean very pale ice blue #edf6fb negative space for web typography, no text, no lettering, no border, no gradients or glow, no photographic elements.

Little Explorer:

> Original watercolor landscape illustration for a Little Explorer baby shower invitation website. Wide horizontal composition. Bottom quarter: miniature rolling sage-green hills, soft blue distant mountains, winding cream trail, tiny pine trees and a little yellow canvas tent. Left edge a small muted coral and pale yellow striped hot-air balloon floats. Upper two thirds pale mint-white empty sky #f4f8f3, abundant negative space for website text. Fine pencil details, delicate children's picture book painting, calm and hopeful, gender neutral. No words, no border, no typography, no animals or people.

## Verification

Shared package build, frontend type check and API unit tests validate the accent contract. The focused event-module suite passes all 16 tests. Sample-data checks validate unique catalogue keys, local artwork, module configurations and category permissions for all 14 designs.

Browser verification covers all 14 sample routes at 360px, 768px and 1440px, image loading, all three accent choices, navigation and preview RSVP interaction. No horizontal overflow was found. Long-title layout checks preserve the page width across the 11 added designs. The grouped selector navigates between categories, and catalogue previews link to the matching design. Preview submissions remain disabled; these checks do not exercise a real RSVP submission. The existing ESLint 10 / React plugin compatibility failure remains a separate tooling issue.
