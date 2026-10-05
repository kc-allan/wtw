import { INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';

/**
 * Exercises the host-to-guest path end to end against a real database:
 * register, create an event, invite a guest, and RSVP with that guest's token.
 */
describe('Events and RSVP (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let eventId: string;
  let eventSlug: string;
  let guestId: string;
  let guestToken: string;

  const email = `e2e-${Date.now()}@worththewait.test`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Events and guests cascade from the account.
      await prisma.account.deleteMany({ where: { members: { some: { userId: user.id } } } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  it('registers a host and returns tokens', async () => {
    const response = await api()
      .post('/api/v1/auth/register')
      .send({ email, password: 'SuperSecret123', name: 'E2E Host' })
      .expect(201);

    expect(response.body.user.email).toBe(email);
    expect(response.body.accessToken).toBeTruthy();
    accessToken = response.body.accessToken;
  });

  it('rejects an unauthenticated request for events', async () => {
    await api().get('/api/v1/events').expect(401);
  });

  it('creates a baby shower with its default modules', async () => {
    const response = await api()
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        typeKey: 'baby_shower',
        title: 'E2E Baby Shower',
        startsAt: new Date(Date.now() + 86_400_000).toISOString(),
      })
      .expect(201);

    eventId = response.body.id;
    eventSlug = response.body.slug;

    const modules = await api()
      .get(`/api/v1/events/${eventId}/modules`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const keys = modules.body.map((module: { key: string }) => module.key);
    expect(keys).toContain('registry');
    expect(keys).toContain('games');
    expect(keys).not.toContain('our_story');
  });

  it('refuses a module the event type does not offer', async () => {
    await api()
      .patch(`/api/v1/events/${eventId}/modules/accommodation`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ enabled: true })
      .expect(400);
  });

  it('adds a guest and issues an invitation link', async () => {
    const guest = await api()
      .post(`/api/v1/events/${eventId}/guests`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Zawadi', maxPartySize: 2 })
      .expect(201);
    guestId = guest.body.id;

    const issued = await api()
      .post(`/api/v1/events/${eventId}/invitations/issue`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ guestIds: [guestId], channel: 'whatsapp' })
      .expect(201);

    const link: string = issued.body[0].link;
    guestToken = new URL(link).searchParams.get('t') ?? '';
    expect(guestToken).not.toBe('');
  });

  it('hides an unpublished event from guests', async () => {
    await api().get(`/api/v1/e/${eventSlug}?t=${guestToken}`).expect(404);
  });

  it('serves the event page once published', async () => {
    await api()
      .post(`/api/v1/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const page = await api().get(`/api/v1/e/${eventSlug}?t=${guestToken}`).expect(200);
    expect(page.body.guest.firstName).toBe('Zawadi');
    expect(page.body.event.title).toBe('E2E Baby Shower');
  });

  it('publishes an event while the date is still undecided', async () => {
    const response = await api()
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        typeKey: 'birthday',
        title: 'Undated Birthday',
      })
      .expect(201);

    await api()
      .post(`/api/v1/events/${response.body.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const page = await api().get(`/api/v1/e/${response.body.slug}`).expect(200);
    expect(page.body.event.startsAt).toBeNull();
  });

  it('turns away an invalid guest token', async () => {
    await api()
      .post(`/api/v1/e/${eventSlug}/rsvp?t=definitely-not-valid`)
      .send({ status: 'attending' })
      .expect(403);
  });

  it('accepts an RSVP within the guest party limit and rejects one over it', async () => {
    await api()
      .post(`/api/v1/e/${eventSlug}/rsvp?t=${guestToken}`)
      .send({ status: 'attending', partySize: 5 })
      .expect(400);

    const response = await api()
      .post(`/api/v1/e/${eventSlug}/rsvp?t=${guestToken}`)
      .send({ status: 'attending', partySize: 1 })
      .expect(200);
    expect(response.body.status).toBe('attending');
  });

  it('accepts a shared-link RSVP and returns a private token for changes', async () => {
    const response = await api()
      .post(`/api/v1/e/${eventSlug}/rsvp`)
      .send({
        firstName: 'Zawadi',
        status: 'not_attending',
        partySize: 1,
        message: 'Same first name, different guest',
      })
      .expect(200);

    expect(response.body.returnToken).toBeTruthy();

    const page = await api()
      .get(`/api/v1/e/${eventSlug}?t=${response.body.returnToken}`)
      .expect(200);
    expect(page.body.guest.firstName).toBe('Zawadi');
    expect(page.body.guest.rsvp.status).toBe('not_attending');
  });

  it('reports the RSVP summary to the host', async () => {
    const summary = await api()
      .get(`/api/v1/events/${eventId}/rsvps/summary`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(summary.body).toMatchObject({ attending: 1, notAttending: 1, totalGuests: 2, totalAttendees: 1 });
  });
});
