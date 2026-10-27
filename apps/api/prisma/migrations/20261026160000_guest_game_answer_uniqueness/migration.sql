DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM game_submissions
    WHERE "guestId" IS NOT NULL
    GROUP BY "gameInstanceId", "guestId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Resolve duplicate guest game answers before applying this migration';
  END IF;
END $$;

CREATE UNIQUE INDEX "game_submissions_gameInstanceId_guestId_key"
  ON "game_submissions"("gameInstanceId", "guestId");
