ALTER TABLE "media_assets"
ADD COLUMN "caption" TEXT,
ADD COLUMN "altText" TEXT,
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "media_assets"
SET "position" = ranked.position
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "eventId" ORDER BY "createdAt" ASC) - 1 AS position
  FROM "media_assets"
  WHERE "eventId" IS NOT NULL
) AS ranked
WHERE "media_assets"."id" = ranked."id";

CREATE INDEX "media_assets_eventId_position_idx" ON "media_assets"("eventId", "position");
