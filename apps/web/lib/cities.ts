/**
 * The places most celebrations are held, offered as a list so the guest list,
 * vendor search and anything else grouping by place can rely on the spelling.
 * Weddings happen well beyond these, which is what the escape hatch is for.
 */
export const CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Nyeri",
  "Thika",
  "Machakos",
  "Meru",
  "Kakamega",
  "Kisii",
  "Naivasha",
  "Malindi",
  "Diani",
  "Kericho",
  "Embu",
  "Garissa",
  "Kitale",
] as const;

/** Chosen when the place is not on the list; a free-text field takes over. */
export const OTHER_CITY = "__other";
