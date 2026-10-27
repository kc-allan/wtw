ALTER TABLE "refresh_tokens"
ADD COLUMN "replayTokensCiphertext" TEXT,
ADD COLUMN "replayExpiresAt" TIMESTAMP(3);

CREATE INDEX "refresh_tokens_replayExpiresAt_idx"
ON "refresh_tokens"("replayExpiresAt");
