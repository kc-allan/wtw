import { EventModuleKey, EventStatus, EventTypeKey, EventVisibility } from "@wtw/shared";
import type { InvitationDesign } from "./invitation-designs";
import type { EventModuleView, PublicEvent } from "./types";

type Sample = { title: string; names: string[]; venue: string; description: string; programme: [string, string][] };

const SAMPLES: Record<EventTypeKey, Sample> = {
  wedding: { title: "Amina & Daniel", names: ["Amina", "Daniel"], venue: "The garden house",
    description: "With full hearts and our favourite people, we're beginning a new chapter. It would mean the world to have you with us as we say I do.",
    programme: [["The vows", "Our forever begins, surrounded by you."], ["A little celebration", "Drinks, laughter and a toast to what's next."], ["Dinner & dancing", "An evening with our favourite people."]] },
  birthday: { title: "Nia's birthday party", names: ["Nia"], venue: "The party room",
    description: "Another year, another reason to bring our favourite people together. Come for the celebration and stay for the stories. We can't wait to see you.",
    programme: [["Hello, everyone", "A little catching up to get the party started."], ["Let the fun begin", "Good company and plenty to celebrate."], ["Make a wish", "Cake, candles and one more birthday wish."]] },
  baby_shower: { title: "A shower for Maya", names: ["Maya"], venue: "The garden room",
    description: "A small arrival, a very big love. Join us to celebrate Maya and the new adventure ahead, with an afternoon of stories, treats and good wishes.",
    programme: [["Tea & hellos", "Settle in with something lovely to drink."], ["Wishes for the little one", "A few games and a little advice from the people we love."], ["Something sweet", "Cake, laughter and a happy afternoon together."]] },
  graduation: { title: "Wanjiru's graduation", names: ["Wanjiru"], venue: "The reading room",
    description: "The late nights, the little victories, the people who kept us going. This milestone belongs to all of you, too. Join us to celebrate everything that comes next.",
    programme: [["Welcome", "Gather with family and friends."], ["A few words", "Stories, thank-yous and a toast to the graduate."], ["Lunch together", "Good food and a well-earned celebration."]] },
  anniversary: { title: "Amina & Daniel's anniversary", names: ["Amina", "Daniel"], venue: "The rose garden",
    description: "Through ordinary mornings and extraordinary moments, love has made a life of it. Join us for an evening with the people who have been part of our story.",
    programme: [["Together again", "A welcome drink and familiar faces."], ["Our favourite memories", "A few stories from the years we've shared."], ["Dinner & a toast", "To the years behind us and the ones still to come."]] },
  bridal_shower: { title: "A toast to Amina", names: ["Amina"], venue: "The rose room",
    description: "Before the big day, an afternoon just for her. Join us to celebrate Amina with flowers, good company and a toast to everything ahead.",
    programme: [["A little fizz", "A welcome toast to the bride-to-be."], ["Around the table", "Lunch, laughter and stories worth sharing."], ["Sweet wishes", "Cake and a few words for the next chapter."]] },
  corporate: { title: "The Ideas Forum", names: ["The Ideas Forum"], venue: "The assembly hall",
    description: "Bring a fresh perspective. Join our community for a day of thoughtful conversations, practical ideas and new connections.",
    programme: [["Arrival & coffee", "Meet fellow attendees before the opening session."], ["Opening conversation", "Ideas, experiences and questions from across the room."], ["Roundtable discussions", "A chance to share perspectives and make connections."]] },
};

function moduleView(key: EventModuleKey, position: number, config: Record<string, unknown> = {}): EventModuleView {
  return { key, name: key, description: "", tier: "free", surface: "public", enabled: true, required: false, position, config };
}

export function invitationSample(design: InvitationDesign, accent: string): { event: PublicEvent["event"]; modules: EventModuleView[] } {
  const sample = { ...SAMPLES[design.category] };
  if (design.sampleTitle) sample.title = design.sampleTitle;
  if (design.sampleTitle?.includes("Nadia")) sample.names = ["Nadia"];
  if (design.sampleTitle?.includes("Leo")) sample.names = ["Leo"];
  const children = ["space", "dinosaur", "trucks", "rainbow", "mermaid", "safari-animals", "pirate-adventure", "unicorn-dream", "fairy-garden", "birthday-pastel", "ballerina", "jungle-adventure", "under-the-sea", "circus-day", "candyland", "carnival", "outer-space"].includes(design.kind);
  if (design.kind === "gaming") {
    sample.names = ["Leo"];
    sample.venue = "The player lounge";
    sample.description = "A new birthday level calls for our favourite squad. Join Leo for friendly games, snacks and cake. Whether you play every day or are picking up a controller for the first time, you're on the team.";
  }
  if (design.kind === "sporty") {
    sample.venue = "The club grounds";
    sample.description = "Nia's birthday team is getting together for an afternoon of friendly games and a well-earned slice of cake. Come ready to cheer, play or simply enjoy the company.";
  }
  if (["dinosaur", "trucks"].includes(design.kind)) sample.names = ["Leo"];
  if (design.kind === "dinosaur") {
    sample.venue = "The adventure garden";
    sample.description = "Our little explorer is ready for a roaring birthday. Join Leo for an afternoon of games, discoveries and a very important slice of cake.";
  }
  if (design.kind === "trucks") {
    sample.venue = "The play yard";
    sample.description = "We've got big plans for Leo's birthday: little builders, plenty of games and a cake worth digging into. Bring your favourite grown-up and join the birthday crew.";
  }
  if (design.kind === "rainbow") {
    sample.venue = "The sunshine room";
    sample.description = "Bright colours, happy faces and a birthday wish or two. Come celebrate Nia with an afternoon of play, treats and all the people who make her world brighter.";
  }
  if (design.kind === "mermaid") {
    sample.venue = "The coral room";
    sample.description = "A little make-believe, a lot of birthday magic. Join Nia for an under-the-sea celebration with games, sweet treats and stories to take home.";
  }
  const coastal = design.kind === "coastal";
  if (design.kind === "space") {
    sample.title = "Leo turns 7";
    sample.names = ["Leo"];
    sample.description = "Our favourite explorer is ready for another trip around the sun. Join Leo for an afternoon of space adventures, birthday cake and a whole crew of friends.";
    sample.programme = [["Crew check-in", "Meet the other explorers and get ready for launch."], ["Mission: birthday", "Games and adventures for the whole crew."], ["Cake on the moon", "Back to base for cake and birthday wishes."]];
  }
  if (design.kind === "neon") sample.title = "Nia's birthday night";
  if (design.kind === "cocktail") {
    sample.venue = "The aperitivo room";
  }
  if (design.kind === "forty") {
    sample.venue = "The courtyard";
    sample.description = "Forty years of stories, friendships and wonderful surprises. Let's raise a glass to all of it, and to everything still ahead. Come celebrate with Nia.";
  }
  if (design.kind === "golden-hour") sample.venue = "The terrace room";
  if (design.kind === "birthday-floral") sample.venue = "The rose garden";
  if (design.kind === "sweet-sixteen") {
    sample.names = ["Nia"];
    sample.venue = "The city garden";
    sample.description = "Sixteen years of becoming wonderfully, unmistakably you. Join Nia and her favourite people for a milestone night to remember.";
  }
  if (["university", "graduation-nocturne", "future-chapter"].includes(design.kind)) sample.venue = "The university hall";
  if (["anniversary-gold", "silver-anniversary"].includes(design.kind)) sample.venue = "The garden room";
  if (design.kind === "anniversary-dinner") sample.venue = "The candlelit dining room";
  if (design.kind === "bride-to-be") sample.venue = "The rose salon";
  if (design.kind === "floral-brunch") sample.venue = "The garden table";
  if (design.kind === "boho-bride") sample.venue = "The meadow room";
  if (["modern-corporate", "product-launch"].includes(design.kind)) sample.venue = "The assembly hall";
  if (design.kind === "awards-gala") sample.venue = "The grand ballroom";
  if (design.kind === "networking") sample.venue = "The atrium";
  if (design.kind === "year-end") sample.venue = "The terrace room";
  if (["safari-animals", "jungle-adventure"].includes(design.kind)) sample.venue = "The adventure garden";
  if (design.kind === "pirate-adventure") sample.venue = "The harbour garden";
  if (["unicorn-dream", "fairy-garden"].includes(design.kind)) sample.venue = "The storybook garden";
  if (["birthday-pastel", "ballerina"].includes(design.kind)) sample.venue = "The little theatre";
  if (["under-the-sea", "outer-space"].includes(design.kind)) sample.venue = "The discovery room";
  if (["circus-day", "carnival"].includes(design.kind)) sample.venue = "The fairground";
  if (design.kind === "candyland") sample.venue = "The sweet shop garden";
  if (design.kind === "pyjama-party") sample.venue = "The sleepover den";
  if (["glow-party", "graffiti", "pop-culture", "k-pop"].includes(design.kind)) sample.venue = "The celebration hall";
  if (design.kind === "gilded") sample.venue = "The conservatory";
  if (design.kind === "champagne") sample.venue = "The reception gardens";
  if (design.kind === "emerald") sample.venue = "The palm house";
  if (design.kind === "porcelain") sample.venue = "The blue drawing room";
  if (design.kind === "pampas") sample.venue = "The meadow house";
  if (design.kind === "safari") sample.venue = "The acacia garden";
  if (design.kind === "kitenge") sample.venue = "The courtyard gardens";
  if (design.kind === "woven") sample.venue = "The sculpture court";
  if (design.kind === "timber") sample.venue = "The orchard barn";
  if (["burgundy", "nocturne"].includes(design.kind)) sample.venue = "The evening room";
  if (design.kind === "brunch") {
    sample.title = "Nia's birthday brunch";
    sample.venue = "The breakfast table";
    sample.programme = [["Coffee & catch-ups", "Settle in. There's no such thing as too much catching up."], ["Around the table", "Something sweet, something savoury, and a toast to another year."], ["One more slice", "Birthday cake and absolutely no rush to leave."]];
  }
  if (design.kind === "blacktie") sample.venue = "The grand ballroom";
  if (design.kind === "monochrome") sample.venue = "The gallery";
  if (coastal) sample.venue = "The ocean garden";
  const hour = ["neon", "blacktie", "cocktail", "forty", "burgundy", "nocturne"].includes(design.kind) ? 15 : design.category === EventTypeKey.CORPORATE ? 6 : 11;
  const startsAt = `2027-06-19T${String(hour).padStart(2, "0")}:00:00Z`;
  const event: PublicEvent["event"] = {
    id: "sample", slug: "sample", title: sample.title, hostNames: sample.names, description: sample.description,
    tagline: null, typeKey: design.category, startsAt, endsAt: null, timezone: "Africa/Nairobi",
    expectedGuests: null, city: coastal ? "Diani" : "Nairobi", venueName: sample.venue,
    venueAddress: coastal ? "Diani Beach, Kenya" : "Karen, Nairobi, Kenya",
    latitude: null, longitude: null, status: EventStatus.DRAFT, visibility: EventVisibility.UNLISTED,
    guestListFormEnabled: false, currency: "KES",
    theme: { key: design.key, name: design.name, group: design.category, palette: design.palette, isPremium: false },
  };
  const modules = [moduleView(EventModuleKey.INVITATION, 0, { accentColor: accent }), moduleView(EventModuleKey.EVENT_DETAILS, 1)];
  if (design.category === EventTypeKey.WEDDING) {
    modules.push(moduleView(EventModuleKey.OUR_STORY, 2, { sections: [
      { title: "A chance meeting", body: "One rainy afternoon, a friend's dinner brought us to the same table. The conversation carried on long after everyone else had gone home." },
      { title: "A thousand little yeses", body: "Sunday walks, shared playlists, and a life that feels more like ours every day. Now, our favourite chapter begins with you beside us." },
    ] }));
    const formal = design.kind === "blacktie";
    modules.push(moduleView(EventModuleKey.DRESS_CODE, 4, {
      title: formal ? "Black tie" : coastal ? "Coastal elegance" : design.kind === "monochrome" ? "Modern elegance" : "Garden party",
      description: formal ? "An evening to dress up for. Tuxedos, evening gowns and your favourite dancing shoes." : "Dress for a celebration, and bring shoes you can dance in.",
    }));
  }
  if (design.category === EventTypeKey.WEDDING) {
    modules.push(moduleView(EventModuleKey.TIMELINE, 3, { entries: sample.programme.map(([title, description], index) => ({
      startsAt: `2027-06-19T${String(hour + index).padStart(2, "0")}:00:00Z`, title, description,
    })) }));
  } else {
    modules.push(moduleView(EventModuleKey.VENUE_MAP, 3, { venues: [{ label: sample.venue, address: "Karen, Nairobi, Kenya",
      directionsNote: design.category === EventTypeKey.CORPORATE ? "Our welcome desk will be at the main entrance. Please arrive a little early to settle in." : ["gaming", "sporty"].includes(design.kind) ? "We'll meet you at the main entrance. Come a little early and settle in with the team." : "We'll meet you at the garden entrance. Come a little early and make yourself at home.",
    }] }));
    modules.push(moduleView(EventModuleKey.COUNTDOWN, 4, { targetAt: startsAt }));
  }
  modules.push(moduleView(EventModuleKey.RSVP, 5, { allowMaybe: false, allowPlusOnes: true, maxPartySize: children ? 4 : 2, collectMessage: true }));
  return { event, modules };
}
