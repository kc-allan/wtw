-- AlterTable
ALTER TABLE "events" ADD COLUMN     "city" TEXT,
ADD COLUMN     "expectedGuests" INTEGER;

-- AlterTable
ALTER TABLE "rsvp_responses" ADD COLUMN     "mealChoice" TEXT;
