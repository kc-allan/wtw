-- CreateEnum
CREATE TYPE "CeremonyKey" AS ENUM ('introductions', 'dowry', 'traditional', 'religious', 'reception', 'send_off');

-- CreateEnum
CREATE TYPE "HostRole" AS ENUM ('bride', 'groom', 'planner', 'other');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "hostRole" "HostRole";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_identities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ceremonies" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "key" "CeremonyKey" NOT NULL,
    "name" TEXT NOT NULL,
    "themeId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "venueName" TEXT,
    "venueAddress" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "dressCode" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ceremonies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_ceremonies" (
    "guestId" TEXT NOT NULL,
    "ceremonyId" TEXT NOT NULL,

    CONSTRAINT "guest_ceremonies_pkey" PRIMARY KEY ("guestId","ceremonyId")
);

-- CreateIndex
CREATE INDEX "user_identities_userId_idx" ON "user_identities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_identities_provider_providerUserId_key" ON "user_identities"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "ceremonies_eventId_position_idx" ON "ceremonies"("eventId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ceremonies_eventId_key_key" ON "ceremonies"("eventId", "key");

-- CreateIndex
CREATE INDEX "guest_ceremonies_ceremonyId_idx" ON "guest_ceremonies"("ceremonyId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ceremonies" ADD CONSTRAINT "ceremonies_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ceremonies" ADD CONSTRAINT "ceremonies_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_ceremonies" ADD CONSTRAINT "guest_ceremonies_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_ceremonies" ADD CONSTRAINT "guest_ceremonies_ceremonyId_fkey" FOREIGN KEY ("ceremonyId") REFERENCES "ceremonies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

