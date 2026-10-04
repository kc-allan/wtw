/**
 * What each design is called, what it feels like, and who it suits.
 *
 * The catalogue itself lives in the database and arrives from `/themes`, which
 * carries a name, a group and a palette but no words. Keeping the words here
 * means they can be rewritten without a migration or a reseed, and it keeps one
 * file to hand to anyone editing the tone.
 *
 * House rules for anything added below:
 *  - three descriptors, each true of this design and not of its neighbours;
 *  - one sentence about the celebration it suits, not about the artwork;
 *  - no reaching for "classic", "luxury" or "elegant" as a catch-all, and never
 *    the same three words twice;
 *  - where a design carries a character or brand, the sentence describes the
 *    party rather than the character, so the copy stands on its own.
 */
export interface DesignCopy {
  descriptors: [string, string, string];
  description: string;
}

export const designCopy: Record<string, DesignCopy> = {
  // Weddings — classic and elegant
  "wedding-white-and-gold": {
    descriptors: ["Timeless", "Elegant", "Refined"],
    description:
      "For celebrations where classic elegance never goes out of style.",
  },
  "wedding-ivory-and-champagne": {
    descriptors: ["Soft", "Warm", "Romantic"],
    description:
      "Candlelit and unhurried, for a day that feels gentle from beginning to end.",
  },
  "wedding-black-tie": {
    descriptors: ["Formal", "Striking", "Confident"],
    description:
      "For an evening with a dress code, and every intention of keeping to it.",
  },
  "wedding-modern-monochrome": {
    descriptors: ["Clean", "Graphic", "Current"],
    description: "Black ink and white space, with nothing competing for attention.",
  },

  // Weddings — the glamorous end
  "wedding-emerald-green": {
    descriptors: ["Deep", "Lush", "Opulent"],
    description: "Jewel green and gold, for a celebration that fills the room.",
  },
  "wedding-royal-blue-and-gold": {
    descriptors: ["Regal", "Bold", "Ceremonial"],
    description:
      "For a wedding with real occasion to it, and guests dressed accordingly.",
  },
  "wedding-burgundy-luxury": {
    descriptors: ["Rich", "Velvety", "Dramatic"],
    description:
      "Deep wine tones for a reception that starts as the light goes.",
  },
  "wedding-black-and-gold": {
    descriptors: ["Glamorous", "Polished", "Bold"],
    description: "Gold on black, for a night that leans all the way into it.",
  },

  // Weddings — outdoors
  "wedding-garden-wedding": {
    descriptors: ["Fresh", "Green", "Unhurried"],
    description:
      "For vows under trees, long tables and an afternoon that runs late.",
  },
  "wedding-tropical-greenery": {
    descriptors: ["Verdant", "Vivid", "Relaxed"],
    description: "Broad leaves and bright green, for a wedding somewhere warm.",
  },
  "wedding-rustic-wood": {
    descriptors: ["Earthy", "Handmade", "Warm"],
    description:
      "For a barn, a farm, or anywhere with wooden beams and hanging lights.",
  },
  "wedding-boho-pampas": {
    descriptors: ["Soft", "Textured", "Free-spirited"],
    description:
      "Dried grasses and neutral tones, for a wedding that never tries too hard.",
  },

  // Weddings — inspired by home
  "wedding-safari-chic": {
    descriptors: ["Bold", "Warm", "Unforgettable"],
    description:
      "Inspired by the beauty of the African landscape, for celebrations with a little adventure.",
  },
  "wedding-coastal-diani-and-lamu": {
    descriptors: ["Relaxed", "Elegant", "Effortless"],
    description:
      "Inspired by the Kenyan coast, from sun soaked Diani days to the timeless charm of Lamu.",
  },
  "wedding-afro-luxury": {
    descriptors: ["Rich", "Modern", "Distinctive"],
    description:
      "Contemporary African style with a touch of luxury, made for celebrations that deserve to stand out.",
  },
  "wedding-kitenge-modern": {
    descriptors: ["Colourful", "Contemporary", "Distinctive"],
    description: "Traditional inspiration, reimagined for a modern celebration.",
  },

  // Birthdays — the little ones
  "birthday-bluey": {
    descriptors: ["Playful", "Colourful", "Fun"],
    description:
      "For a birthday full of made-up games, backyard adventures and a lot of laughing.",
  },
  "birthday-paw-patrol": {
    descriptors: ["Brave", "Busy", "Cheerful"],
    description: "For a small person who is always on a rescue mission.",
  },
  "birthday-spider-man": {
    descriptors: ["Daring", "Bold", "High-energy"],
    description: "Red, blue and full of nerve, for a birthday spent climbing everything.",
  },
  "birthday-batman": {
    descriptors: ["Dark", "Heroic", "Cool"],
    description: "Night skies and city lights, for a birthday with a bit of mystery to it.",
  },
  "birthday-superman": {
    descriptors: ["Strong", "Classic", "Uplifting"],
    description: "Endlessly optimistic, for a birthday with a cape involved.",
  },
  "birthday-avengers": {
    descriptors: ["Epic", "Action-packed", "Bold"],
    description: "For a party where everyone arrives with a superpower of their own.",
  },
  "birthday-cars": {
    descriptors: ["Fast", "Bright", "Fun"],
    description: "For a birthday measured in laps of the garden.",
  },
  "birthday-hot-wheels": {
    descriptors: ["Speedy", "Loud", "Competitive"],
    description: "Orange track and bright flags, for a race that has to be run twice.",
  },
  "birthday-sonic": {
    descriptors: ["Quick", "Bright", "Spirited"],
    description: "Blue, fast and never standing still — much like the birthday child.",
  },
  "birthday-super-mario": {
    descriptors: ["Retro", "Colourful", "Cheerful"],
    description: "For a birthday with levels to clear and coins to collect.",
  },
  "birthday-dinosaur-adventure": {
    descriptors: ["Roaring", "Playful", "Adventurous"],
    description:
      "For little explorers ready for a birthday millions of years in the making.",
  },
  "birthday-construction-trucks": {
    descriptors: ["Busy", "Bold", "Hands-on"],
    description: "Diggers, dust and hard hats, for a birthday spent building something.",
  },
  "birthday-space-explorer": {
    descriptors: ["Starry", "Curious", "Adventurous"],
    description: "For a small astronaut with a countdown of their own.",
  },
  "birthday-safari-animals": {
    descriptors: ["Wild", "Colourful", "Adventurous"],
    description: "For little explorers ready for a wild day of fun.",
  },
  "birthday-pirates": {
    descriptors: ["Mischievous", "Bold", "Adventurous"],
    description: "Treasure maps, paper hats and a birthday spent hunting for loot.",
  },
  "birthday-disney-princess": {
    descriptors: ["Regal", "Sparkling", "Magical"],
    description: "Ballgowns and tiaras, for a birthday fit for royalty.",
  },
  "birthday-barbie": {
    descriptors: ["Pink", "Bold", "Playful"],
    description: "Unapologetically pink, for a birthday with a strong sense of style.",
  },
  "birthday-frozen": {
    descriptors: ["Icy", "Sparkling", "Enchanting"],
    description:
      "Snowflakes and pale blue, for a birthday with a little frost and a lot of magic.",
  },
  "birthday-unicorn": {
    descriptors: ["Magical", "Colourful", "Whimsical"],
    description: "For a birthday filled with a little extra magic.",
  },
  "birthday-peppa-pig": {
    descriptors: ["Sweet", "Simple", "Cheerful"],
    description:
      "Gentle and silly in equal measure, for the very smallest guest of honour.",
  },
  "birthday-minnie-mouse": {
    descriptors: ["Classic", "Polka-dot", "Charming"],
    description: "Red, white and bow-topped, for a birthday that never gets old.",
  },
  "birthday-hello-kitty": {
    descriptors: ["Cute", "Pastel", "Sweet"],
    description: "Soft pinks and small details, for a birthday with a lot of charm.",
  },
  "birthday-rainbow": {
    descriptors: ["Bright", "Joyful", "Colourful"],
    description: "Every colour at once, because choosing one was never going to happen.",
  },
  "birthday-fairies": {
    descriptors: ["Delicate", "Green", "Whimsical"],
    description: "Woodland and wings, for a birthday at the bottom of the garden.",
  },
  "birthday-mermaid": {
    descriptors: ["Shimmering", "Aquatic", "Dreamy"],
    description: "Sea green and shell pink, for a birthday spent mostly underwater.",
  },
  "birthday-encanto": {
    descriptors: ["Warm", "Vibrant", "Musical"],
    description: "Bright colours and a full house, for a birthday that feels like family.",
  },
  "birthday-moana": {
    descriptors: ["Oceanic", "Brave", "Bright"],
    description:
      "Turquoise water and an open horizon, for a birthday with somewhere to sail.",
  },
  "birthday-pastel": {
    descriptors: ["Soft", "Gentle", "Pretty"],
    description: "Quiet colours for a party that is more tea set than disco.",
  },
  "birthday-ballerina": {
    descriptors: ["Graceful", "Delicate", "Pink"],
    description: "Tulle, ribbon and a birthday spent on tiptoe.",
  },
  "birthday-jungle-safari": {
    descriptors: ["Leafy", "Lively", "Adventurous"],
    description: "Vines and animal prints, for a party that escapes into the wild.",
  },
  "birthday-under-the-sea": {
    descriptors: ["Blue", "Curious", "Playful"],
    description:
      "For a birthday spent among fish, bubbles and the occasional octopus.",
  },
  "birthday-circus": {
    descriptors: ["Big-top", "Bright", "Entertaining"],
    description: "Stripes and popcorn, for a show that starts the moment guests arrive.",
  },
  "birthday-candyland": {
    descriptors: ["Sweet", "Sugary", "Bright"],
    description: "For a birthday built entirely out of sweets, which is rather the point.",
  },
  "birthday-carnival": {
    descriptors: ["Festive", "Loud", "Joyful"],
    description: "Games and prizes, for a garden turned into a fairground.",
  },
  "birthday-outer-space": {
    descriptors: ["Cosmic", "Curious", "Bold"],
    description: "Planets and rockets, for a birthday that leaves the atmosphere.",
  },

  // Birthdays — teens
  "birthday-neon-party": {
    descriptors: ["Bold", "Electric", "Fun"],
    description: "Bright against the dark, for a party that starts after sunset.",
  },
  "birthday-gaming": {
    descriptors: ["Competitive", "Playful", "High energy"],
    description: "For a birthday decided on the leaderboard.",
  },
  "birthday-tiktok": {
    descriptors: ["Current", "Social", "Fast-moving"],
    description: "For a birthday that is going to be filmed from every angle.",
  },
  "birthday-sporty": {
    descriptors: ["Active", "Team-spirited", "Bold"],
    description: "Kit on, for a birthday spent on a pitch, a court or a track.",
  },
  "birthday-k-pop": {
    descriptors: ["Vibrant", "Stylish", "Fan-fuelled"],
    description:
      "Bold colour and choreography, for a birthday with a playlist chosen months ago.",
  },
  "birthday-pop-culture": {
    descriptors: ["Current", "Playful", "Loud"],
    description: "For a birthday built around whatever everyone is obsessed with now.",
  },
  "birthday-glow-party": {
    descriptors: ["Electric", "Social", "After dark"],
    description: "Lights down, glow on, for a party that looks better in the dark.",
  },
  "birthday-pyjama": {
    descriptors: ["Cosy", "Casual", "Fun"],
    description: "Sleeping bags and snacks, for a night nobody intends to sleep through.",
  },
  "birthday-graffiti": {
    descriptors: ["Street", "Bold", "Expressive"],
    description: "Spray-can colour, for a birthday with its own style.",
  },

  // Birthdays — grown up
  "birthday-minimalist-black": {
    descriptors: ["Modern", "Sophisticated", "Understated"],
    description: "For a celebration that makes the details speak for themselves.",
  },
  "birthday-elegant-gold": {
    descriptors: ["Warm", "Refined", "Celebratory"],
    description: "Soft gold on cream, for a birthday dinner worth dressing for.",
  },
  "birthday-floral": {
    descriptors: ["Fresh", "Generous", "Pretty"],
    description: "Blooms in full, for a lunch that stretches into the afternoon.",
  },
  "birthday-champagne-celebration": {
    descriptors: ["Sparkling", "Festive", "Elegant"],
    description: "For a birthday that begins with a toast and keeps going.",
  },
  "birthday-tropical": {
    descriptors: ["Warm", "Vivid", "Easy-going"],
    description: "Palms and punch colours, for a party that belongs outdoors.",
  },
  "birthday-all-white-party": {
    descriptors: ["Crisp", "Striking", "Unified"],
    description: "One colour, one dress code, and a room that photographs beautifully.",
  },
  "birthday-black-and-gold": {
    descriptors: ["Glamorous", "Bold", "Night-time"],
    description: "For a birthday with a guest list dressed to be seen.",
  },
  "birthday-masquerade": {
    descriptors: ["Mysterious", "Theatrical", "Elegant"],
    description:
      "Masks on, for an evening where nobody is quite sure who they are talking to.",
  },
  "birthday-denim-and-white": {
    descriptors: ["Relaxed", "Cool", "Effortless"],
    description: "An easy dress code, for a party that needs no persuading.",
  },
  "birthday-great-gatsby": {
    descriptors: ["Decadent", "Vintage", "Glamorous"],
    description: "Art deco lines and jazz-age excess, for a night with real theatre.",
  },
  "birthday-casino-night": {
    descriptors: ["Slick", "Playful", "Competitive"],
    description: "Cards on the table, for a birthday with stakes.",
  },
  "birthday-roaring-20s": {
    descriptors: ["Vintage", "Lively", "Stylish"],
    description: "Fringe, feathers and a dance floor that fills early.",
  },
  "birthday-brunch-party": {
    descriptors: ["Sunny", "Stunning", "Sociable"],
    description:
      "Made for good food, good company and a birthday worth getting together for.",
  },
  "birthday-rooftop-party": {
    descriptors: ["Elevated", "Social", "Golden hour"],
    description: "Drinks above the city, for a birthday that ends with the skyline lit.",
  },
  "birthday-cocktail-party": {
    descriptors: ["Chic", "Playful", "After dark"],
    description: "An evening of cocktails, conversations and celebrations.",
  },

  // Birthdays — milestones
  "birthday-sweet-16": {
    descriptors: ["Bright", "Memorable", "Grown-up"],
    description: "The birthday that starts to feel like a proper occasion.",
  },
  "birthday-fabulous-21": {
    descriptors: ["Bold", "Celebratory", "Long-awaited"],
    description: "For the one everybody has been counting down to.",
  },
  "birthday-dirty-30": {
    descriptors: ["Confident", "Playful", "Stylish"],
    description: "Old enough to know better, and celebrating anyway.",
  },
  "birthday-cheers-to-40": {
    descriptors: ["Warm", "Assured", "Celebratory"],
    description:
      "For a birthday surrounded by the people who have been there for most of it.",
  },
  "birthday-fabulous-at-50": {
    descriptors: ["Glamorous", "Radiant", "Confident"],
    description: "Half a century, and every reason to make an evening of it.",
  },
  "birthday-diamond-celebration-60-plus": {
    descriptors: ["Distinguished", "Warm", "Honoured"],
    description: "For a birthday that has earned the whole family in one room.",
  },

  // Baby showers
  "baby-shower-floral-garden": {
    descriptors: ["Blooming", "Fresh", "Gentle"],
    description: "Soft blooms for an afternoon of tea, cake and quiet excitement.",
  },
  "baby-shower-pink-and-gold": {
    descriptors: ["Warm", "Sparkling", "Sweet"],
    description: "Blush and gold, for a shower with a little shine to it.",
  },
  "baby-shower-butterfly-wishes": {
    descriptors: ["Delicate", "Airy", "Hopeful"],
    description: "Light and fluttering, for a celebration full of good wishes.",
  },
  "baby-shower-ballerina-baby": {
    descriptors: ["Graceful", "Soft", "Charming"],
    description: "Pale pink and ribbon, for a shower with a gentle touch.",
  },
  "baby-shower-boho-rainbow": {
    descriptors: ["Muted", "Playful", "Modern"],
    description: "Rainbow arcs in earthy tones, for something colourful but calm.",
  },
  "baby-shower-blush-bloom": {
    descriptors: ["Romantic", "Soft", "Pretty"],
    description: "Petal pinks, for a shower that keeps things simple and lovely.",
  },
  "baby-shower-busy-bee": {
    descriptors: ["Cheerful", "Golden", "Sweet"],
    description: "Honey yellow and black, for a shower buzzing with people.",
  },
  "baby-shower-little-prince": {
    descriptors: ["Regal", "Gentle", "Classic"],
    description: "Soft blues and a small crown, for a much-anticipated arrival.",
  },
  "baby-shower-blue-sky": {
    descriptors: ["Open", "Calm", "Optimistic"],
    description: "Clear blue and clouds, for a shower that feels like a fresh start.",
  },
  "baby-shower-sailor-baby": {
    descriptors: ["Nautical", "Crisp", "Classic"],
    description: "Navy stripes and anchors, for a celebration with a sense of adventure.",
  },
  "baby-shower-little-explorer": {
    descriptors: ["Curious", "Warm", "Adventurous"],
    description: "Maps and mountains, for a baby with a lot of world ahead.",
  },
  "baby-shower-little-lion": {
    descriptors: ["Brave", "Golden", "Warm"],
    description: "Savannah tones, for a small arrival with a big roar.",
  },
  "baby-shower-woodland-boy": {
    descriptors: ["Earthy", "Cosy", "Charming"],
    description: "Foxes and forest greens, for a gentle woodland afternoon.",
  },
  "baby-shower-blue-teddy": {
    descriptors: ["Soft", "Familiar", "Comforting"],
    description: "A classic, for a shower that keeps everything warm and simple.",
  },
  "baby-shower-airplanes": {
    descriptors: ["Adventurous", "Playful", "Bright"],
    description: "Propellers and clouds, for a baby already going places.",
  },
  "baby-shower-neutral-beige": {
    descriptors: ["Calm", "Minimal", "Considered"],
    description: "Quiet tones, for a shower that leaves the fuss out.",
  },
  "baby-shower-sage-green": {
    descriptors: ["Fresh", "Serene", "Modern"],
    description: "Soft green, for a celebration that feels unhurried.",
  },
  "baby-shower-minimal-scandinavian": {
    descriptors: ["Clean", "Simple", "Uncluttered"],
    description: "Plenty of white space, for a shower with an eye for design.",
  },
  "baby-shower-earth-tones": {
    descriptors: ["Warm", "Grounded", "Natural"],
    description: "Clay, sand and terracotta, for something natural and understated.",
  },
  "baby-shower-modern-boho": {
    descriptors: ["Textured", "Relaxed", "Stylish"],
    description: "Neutral and layered, for a shower with a relaxed rhythm.",
  },

  // Graduations
  "graduation-university-elegance": {
    descriptors: ["Formal", "Proud", "Composed"],
    description: "For the day the work finally has a certificate attached.",
  },
  "graduation-black-and-gold": {
    descriptors: ["Distinguished", "Sharp", "Celebratory"],
    description: "For a graduate whose family has been waiting for this photograph.",
  },
  "graduation-academic-excellence": {
    descriptors: ["Scholarly", "Refined", "Proud"],
    description: "For results worth telling everybody about.",
  },
  "graduation-future-begins": {
    descriptors: ["Forward-looking", "Bright", "Optimistic"],
    description: "For the celebration that is really about what happens next.",
  },

  // Anniversaries
  "anniversary-romantic-floral": {
    descriptors: ["Tender", "Blooming", "Warm"],
    description: "For the kind of anniversary that still arrives with flowers.",
  },
  "anniversary-gold-celebration": {
    descriptors: ["Golden", "Radiant", "Momentous"],
    description: "For the anniversaries measured in decades.",
  },
  "anniversary-silver-anniversary": {
    descriptors: ["Polished", "Enduring", "Elegant"],
    description: "Twenty-five years, and a room of people who remember the wedding.",
  },
  "anniversary-elegant-dinner": {
    descriptors: ["Intimate", "Refined", "Quiet"],
    description: "For an evening with a short guest list and a long table.",
  },

  // Bridal showers
  "bridal-shower-bride-to-be": {
    descriptors: ["Celebratory", "Bright", "Sweet"],
    description: "For the afternoon that belongs entirely to her.",
  },
  "bridal-shower-floral-brunch": {
    descriptors: ["Fresh", "Sociable", "Pretty"],
    description: "Flowers, fizz and a late morning that runs into lunch.",
  },
  "bridal-shower-champagne-and-roses": {
    descriptors: ["Romantic", "Sparkling", "Indulgent"],
    description: "For a shower with a bottle on ice from the beginning.",
  },
  "bridal-shower-boho-bride": {
    descriptors: ["Relaxed", "Textured", "Free-spirited"],
    description: "Neutral tones and dried flowers, for something easy and beautiful.",
  },

  // Corporate
  "corporate-modern-corporate": {
    descriptors: ["Professional", "Clean", "Assured"],
    description: "Clear and uncluttered, for an invitation that has to be taken seriously.",
  },
  "corporate-conference": {
    descriptors: ["Structured", "Informative", "Confident"],
    description: "For a programme with sessions, speakers and a start time people keep to.",
  },
  "corporate-awards-gala": {
    descriptors: ["Formal", "Prestigious", "Celebratory"],
    description: "For a black-tie evening with a stage and a running order.",
  },
  "corporate-product-launch": {
    descriptors: ["Sharp", "Modern", "Anticipatory"],
    description: "For the evening something new is shown for the first time.",
  },
  "corporate-networking-event": {
    descriptors: ["Open", "Approachable", "Social"],
    description: "For a room of people who have not met yet.",
  },
  "corporate-end-of-year-party": {
    descriptors: ["Festive", "Relaxed", "Sociable"],
    description: "For the night the team stops working and celebrates the year.",
  },
};

/**
 * A section of the browse page. `groups` are the catalogue's own group values,
 * which stay as they are in the database — the layout fallbacks in
 * `app/_data/templates.ts` key off them, so this is a display name only.
 *
 * A collection with `filters` gathers several groups into one section and lets
 * the visitor narrow it, rather than stacking the groups as separate lists.
 */
export interface Collection {
  title: string;
  intro: string;
  groups: string[];
  filters?: { id: string; label: string; group: string | null }[];
}

export const collections: Record<string, Collection[]> = {
  wedding: [
    {
      title: "Inspired by home",
      intro:
        "Celebrations have a sense of place. Explore designs inspired by Kenya's landscapes, colours, cultures and unmistakable style.",
      groups: ["Kenyan inspired"],
    },
    {
      title: "Classic and elegant",
      intro:
        "Designs that were never going to date, for a day you will look back on often.",
      groups: ["Classic and elegant"],
    },
    {
      title: "A little more glamour",
      intro: "Deep colour, gold and evening light, for a wedding with real occasion to it.",
      groups: ["Luxury"],
    },
    {
      title: "Outdoors and in bloom",
      intro: "Gardens, greenery and open air, for vows somewhere with a view.",
      groups: ["Nature inspired"],
    },
  ],
  birthday: [
    {
      title: "Big little personalities",
      intro: "Fun, colourful invitations for birthdays full of imagination and fun.",
      groups: ["Kids (boys)", "Kids (girls)", "Gender neutral kids"],
      filters: [
        { id: "all", label: "All", group: null },
        { id: "boys", label: "For boys", group: "Kids (boys)" },
        { id: "girls", label: "For girls", group: "Kids (girls)" },
        { id: "neutral", label: "For everyone", group: "Gender neutral kids" },
      ],
    },
    {
      title: "For birthdays with their own vibe",
      intro:
        "Bold, fun and a little mature, with designs made for their kind of celebration.",
      groups: ["Teen"],
    },
    {
      title: "For grown up celebrations",
      intro:
        "From elegant dinners, rooftop gatherings, brunches and themed parties, find an invitation to match the occasion.",
      groups: ["Adult"],
    },
    {
      title: "Milestones worth celebrating",
      intro: "Some birthdays deserve more than a cake and a WhatsApp message.",
      groups: ["Milestone"],
    },
  ],
  baby_shower: [
    {
      title: "For a baby girl",
      intro: "Soft colours and gentle details, for an afternoon of tea, cake and wishes.",
      groups: ["Baby girl"],
    },
    {
      title: "For a baby boy",
      intro: "Blues, brights and a little adventure, for the arrival everyone is waiting on.",
      groups: ["Baby boy"],
    },
    {
      title: "Calm and considered",
      intro: "Neutral tones and clean lines, for a shower that keeps the fuss out.",
      groups: ["Modern luxury"],
    },
  ],
  graduation: [
    {
      title: "For the day it all pays off",
      intro: "Designs for a graduate, and for everyone who helped get them there.",
      groups: ["Graduation"],
    },
  ],
  anniversary: [
    {
      title: "Years worth marking",
      intro:
        "From a quiet dinner for two to a room full of people who were at the wedding.",
      groups: ["Anniversary"],
    },
  ],
  bridal_shower: [
    {
      title: "Before the big day",
      intro: "For the afternoon that belongs entirely to the bride.",
      groups: ["Bridal shower"],
    },
  ],
  corporate: [
    {
      title: "For work occasions",
      intro:
        "Clear, professional invitations for launches, conferences, galas and the end of year party.",
      groups: ["Corporate"],
    },
  ],
};

/** The line under the browse page heading, per celebration. */
export const celebrationLead: Record<string, string> = {
  wedding:
    "Choose a design, make it yours, and bring everyone you love into one room.",
  birthday: "For every age, personality and kind of celebration.",
  baby_shower: "Gentle, joyful designs for the celebration before the arrival.",
  graduation: "For the results, the hard years, and everyone who turned up anyway.",
  anniversary: "For the years worth marking, quietly or with everybody there.",
  bridal_shower: "For the afternoon that belongs entirely to the bride.",
  corporate:
    "Professional invitations for the occasions your company puts its name to.",
};
