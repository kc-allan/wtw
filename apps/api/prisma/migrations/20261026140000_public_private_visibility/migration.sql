ALTER TABLE "events" ADD COLUMN "visibilityReviewPending" BOOLEAN NOT NULL DEFAULT false;

UPDATE "events"
SET "visibilityReviewPending" = true
WHERE "visibility" = 'unlisted';

UPDATE "events"
SET "visibility" = 'private'
WHERE "visibility" = 'unlisted';

ALTER TABLE "events" DROP COLUMN "accessCode";

ALTER TYPE "EventVisibility" RENAME TO "EventVisibility_old";
CREATE TYPE "EventVisibility" AS ENUM ('public', 'private');
ALTER TABLE "events" ALTER COLUMN "visibility" DROP DEFAULT;
ALTER TABLE "events" ALTER COLUMN "visibility" TYPE "EventVisibility"
  USING ("visibility"::text::"EventVisibility");
ALTER TABLE "events" ALTER COLUMN "visibility" SET DEFAULT 'private';
DROP TYPE "EventVisibility_old";
