import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import {
  EventTypeKey,
  EVENT_TYPES,
  GameKey,
  InvitationChannel,
  InvitationStatus,
  RsvpStatus,
  parseModuleConfig,
} from '@wtw/shared';
import {
  toDbEventType,
  toDbInvitationChannel,
  toDbInvitationStatus,
  toDbModuleKey,
  toDbRsvpStatus,
  toDbVendorCategory,
  toDbVendorStatus,
} from '../src/core/prisma/enums';
import { seedThemes } from './seed-data/themes';
import { seedVendors } from './seed-data/vendors';
import { generateRawToken, hashToken } from '../src/core/crypto/tokens';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedThemeCatalogue(): Promise<void> {
  for (const theme of seedThemes) {
    await prisma.theme.upsert({
      where: { key: theme.key },
      create: {
        key: theme.key,
        name: theme.name,
        group: theme.group,
        eventTypeKey: toDbEventType(theme.eventTypeKey),
        palette: theme.palette,
        isPremium: theme.isPremium,
        sortOrder: theme.sortOrder,
      },
      update: {
        name: theme.name,
        group: theme.group,
        eventTypeKey: toDbEventType(theme.eventTypeKey),
        palette: theme.palette,
        isPremium: theme.isPremium,
        sortOrder: theme.sortOrder,
      },
    });
  }
  console.log(`  themes:  ${seedThemes.length}`);
}

async function seedVendorDirectory(): Promise<void> {
  for (const vendor of seedVendors) {
    const { slug, categories, eventTypes, ...rest } = vendor;
    const data = {
      ...rest,
      categories: categories.map(toDbVendorCategory),
      eventTypes: eventTypes.map(toDbEventType),
      status: toDbVendorStatus(vendor.status),
    };
    await prisma.vendor.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }
  console.log(`  vendors: ${seedVendors.length}`);
}

/**
 * Builds the module rows for an event straight from its type definition, which
 * is the same path the API uses when a host creates one.
 */
function moduleRowsFor(typeKey: EventTypeKey) {
  return EVENT_TYPES[typeKey].modules.map((slot, index) => ({
    key: toDbModuleKey(slot.key),
    enabled: slot.enabledByDefault,
    position: index,
    config: parseModuleConfig(slot.key, {}) as unknown as Prisma.InputJsonValue,
  }));
}

async function seedDemoWorkspace(): Promise<void> {
  const email = 'demo@worththewait.africa';
  const passwordHash = await argon2.hash('Demo1234!');

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name: 'Demo Host', phone: '+254700000000' },
    update: { passwordHash },
  });

  const account = await prisma.account.upsert({
    where: { slug: 'demo-host' },
    create: {
      slug: 'demo-host',
      name: 'Demo Host',
      members: { create: { userId: user.id, role: 'owner' } },
    },
    update: {},
  });

  const weddingTheme = await prisma.theme.findUnique({
    where: { key: 'wedding-kitenge-modern' },
  });
  const showerTheme = await prisma.theme.findUnique({
    where: { key: 'baby-shower-sage-green' },
  });

  const inSixMonths = new Date(Date.now() + 1000 * 60 * 60 * 24 * 182);
  const inTwoMonths = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);

  const wedding = await prisma.event.upsert({
    where: { slug: 'amina-and-brian' },
    create: {
      accountId: account.id,
      createdById: user.id,
      typeKey: toDbEventType(EventTypeKey.WEDDING),
      themeId: weddingTheme?.id,
      slug: 'amina-and-brian',
      title: 'Amina & Brian',
      tagline: 'Together with their families',
      hostNames: ['Amina', 'Brian'],
      startsAt: inSixMonths,
      timezone: 'Africa/Nairobi',
      venueName: 'Karura Gardens',
      venueAddress: 'Limuru Road, Nairobi',
      latitude: -1.2384,
      longitude: 36.8329,
      status: 'published',
      visibility: 'unlisted',
      publishedAt: new Date(),
      modules: { create: moduleRowsFor(EventTypeKey.WEDDING) },
    },
    update: {},
  });

  const babyShower = await prisma.event.upsert({
    where: { slug: 'baby-mwangi' },
    create: {
      accountId: account.id,
      createdById: user.id,
      typeKey: toDbEventType(EventTypeKey.BABY_SHOWER),
      themeId: showerTheme?.id,
      slug: 'baby-mwangi',
      title: 'Baby Mwangi',
      tagline: 'A morning to welcome the little one',
      hostNames: ['Grace'],
      startsAt: inTwoMonths,
      venueName: 'The Alchemist',
      venueAddress: 'Parklands, Nairobi',
      status: 'published',
      visibility: 'unlisted',
      publishedAt: new Date(),
      modules: { create: moduleRowsFor(EventTypeKey.BABY_SHOWER) },
      games: {
        create: [
          { gameKey: GameKey.GUESS_BIRTH_DATE, position: 0 },
          { gameKey: GameKey.GUESS_WEIGHT, position: 1 },
          { gameKey: GameKey.WISHES_FOR_BABY, position: 2 },
        ],
      },
    },
    update: {},
  });

  const existingGuests = await prisma.guest.count({ where: { eventId: wedding.id } });
  if (existingGuests === 0) {
    const roster = [
      { firstName: 'Wanjiru', lastName: 'Kamau', email: 'wanjiru@example.com', groupLabel: "Bride's family", maxPartySize: 2 },
      { firstName: 'Kip', lastName: 'Ruto', phone: '+254711111111', groupLabel: "Groom's friends", maxPartySize: 1 },
      { firstName: 'Grace', lastName: 'Otieno', email: 'grace@example.com', groupLabel: 'University', maxPartySize: 2 },
      { firstName: 'Daniel', lastName: 'Mwangi', email: 'daniel@example.com', groupLabel: 'Work', maxPartySize: 1 },
    ];

    for (const entry of roster) {
      const guest = await prisma.guest.create({
        data: { eventId: wedding.id, ...entry },
      });
      const rawToken = generateRawToken();
      await prisma.invitation.create({
        data: {
          eventId: wedding.id,
          guestId: guest.id,
          tokenHash: hashToken(rawToken),
          channel: toDbInvitationChannel(InvitationChannel.WHATSAPP),
          status: toDbInvitationStatus(InvitationStatus.SENT),
          sentAt: new Date(),
          sentCount: 1,
        },
      });
      // Printed so a developer can open a guest link without querying the database.
      console.log(`  invite:  ${guest.firstName} -> /e/${wedding.slug}?t=${rawToken}`);
    }

    const firstGuest = await prisma.guest.findFirst({
      where: { eventId: wedding.id },
      orderBy: { createdAt: 'asc' },
    });
    if (firstGuest) {
      await prisma.rsvpResponse.create({
        data: {
          eventId: wedding.id,
          guestId: firstGuest.id,
          status: toDbRsvpStatus(RsvpStatus.ATTENDING),
          partySize: 2,
          attendeeNames: ['Wanjiru Kamau', 'Peter Kamau'],
          message: 'Would not miss it.',
        },
      });
    }
  }

  console.log(`  events:  ${wedding.slug}, ${babyShower.slug}`);
  console.log(`  login:   ${email} / Demo1234!`);
}

async function main(): Promise<void> {
  console.log('Seeding Worth The Wait…');
  await seedThemeCatalogue();
  await seedVendorDirectory();

  // Demo content is for local and staging work only.
  if (process.env.NODE_ENV !== 'production') {
    await seedDemoWorkspace();
  }

  console.log('Done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
