CREATE TABLE "public_rsvp_submissions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_rsvp_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "public_rsvp_submissions_guestId_key"
ON "public_rsvp_submissions"("guestId");

CREATE UNIQUE INDEX "public_rsvp_submissions_eventId_keyHash_key"
ON "public_rsvp_submissions"("eventId", "keyHash");

CREATE INDEX "public_rsvp_submissions_eventId_createdAt_idx"
ON "public_rsvp_submissions"("eventId", "createdAt");

ALTER TABLE "public_rsvp_submissions"
ADD CONSTRAINT "public_rsvp_submissions_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public_rsvp_submissions"
ADD CONSTRAINT "public_rsvp_submissions_guestId_fkey"
FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
