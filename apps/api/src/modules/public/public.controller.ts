import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../core/auth/public.decorator';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import { claimRegistryItemSchema, type ClaimRegistryItemInput } from '../registry/registry.schemas';
import { RegistryService } from '../registry/registry.service';
import { submitGameSchema, type SubmitGameInput } from '../games/games.schemas';
import { GamesService } from '../games/games.service';
import { RsvpService } from '../rsvp/rsvp.service';
import {
  joinGuestListSchema,
  publicRsvpSchema,
  type JoinGuestListInput,
  type PublicRsvpInput,
} from './public.schemas';
import { PublicEventsService } from './public-events.service';

/**
 * Everything a guest can reach without an account. Authorisation comes from
 * possession of the invitation token in `t`, never from a session.
 */
@ApiTags('public')
@Public()
@Controller('e')
export class PublicController {
  constructor(
    private readonly publicEvents: PublicEventsService,
    private readonly rsvp: RsvpService,
    private readonly registry: RegistryService,
    private readonly games: GamesService,
  ) {}

  @Get('sitemap')
  @ApiOperation({ summary: 'Published public events for the sitemap' })
  sitemap() {
    return this.publicEvents.indexableSlugs();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'The public event page with its enabled modules' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  get(
    @Param('slug') slug: string,
    @Query('t') token?: string,
  ) {
    return this.publicEvents.getBySlug(slug, token);
  }

  @Post(':slug/rsvp')
  @HttpCode(HttpStatus.OK)
  // Guest endpoints are unauthenticated, so they get a tighter budget.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit or update an RSVP' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  @ApiZodBody(publicRsvpSchema, 'SubmitRsvp')
  async submitRsvp(
    @Param('slug') slug: string,
    @Query('t') token: string | undefined,
    @Body(zodBody(publicRsvpSchema)) body: PublicRsvpInput,
  ) {
    if (token) {
      const { eventId, guest } = await this.publicEvents.requireGuest(slug, token);
      return this.rsvp.submit(eventId, guest.id, guest.invitationId, body);
    }

    if (!body.firstName) {
      throw new BadRequestException('Tell us your name so the hosts know who replied');
    }
    if (!body.idempotencyKey) {
      throw new BadRequestException('Please refresh the page and try again');
    }

    const { eventId } = await this.publicEvents.requireAccess(slug);
    return this.rsvp.submitPublicLink(eventId, body as PublicRsvpInput & { firstName: string }, body.idempotencyKey);
  }

  @Post(':slug/guest-list')
  @HttpCode(HttpStatus.OK)
  // Anyone with the link can post here, so the budget is the tightest we have.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Add yourself to a guest list the host opened' })
  @ApiZodBody(joinGuestListSchema, 'JoinGuestList')
  joinGuestList(
    @Param('slug') slug: string,
    @Body(zodBody(joinGuestListSchema)) body: JoinGuestListInput,
  ) {
    return this.publicEvents.addSelfToGuestList(slug, body);
  }

  @Get(':slug/gallery')
  @ApiOperation({ summary: 'Photos on a published event' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  async gallery(
    @Param('slug') slug: string,
    @Query('t') token?: string,
  ) {
    const { eventId } = await this.publicEvents.requireAccess(slug, token);
    return this.publicEvents.gallery(eventId);
  }

  @Get(':slug/registry')
  @ApiOperation({ summary: 'The gift registry as guests see it' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  async registryItems(
    @Param('slug') slug: string,
    @Query('t') token?: string,
  ) {
    const { eventId } = await this.publicEvents.requireAccess(slug, token);
    return this.registry.listForGuests(eventId);
  }

  @Post(':slug/registry/:itemId/claim')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Reserve a gift, or record a cash contribution' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  @ApiZodBody(claimRegistryItemSchema, 'ClaimRegistryItem')
  async claimRegistryItem(
    @Param('slug') slug: string,
    @Param('itemId') itemId: string,
    @Body(zodBody(claimRegistryItemSchema)) body: ClaimRegistryItemInput,
    @Query('t') token?: string,
  ) {
    // A guest without a token can still give, so long as they can reach the
    // page at all; the claim simply carries the name they typed.
    const { eventId, guest } = await this.publicEvents.requireAccess(slug, token);
    return this.registry.claim(eventId, itemId, guest?.id ?? null, body);
  }

  @Get(':slug/games')
  @ApiOperation({ summary: 'Games guests can play, without the answer keys' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  async gameList(
    @Param('slug') slug: string,
    @Query('t') token?: string,
  ) {
    const { eventId } = await this.publicEvents.requireAccess(slug, token);
    return this.games.listForGuests(eventId);
  }

  @Post(':slug/games/:gameInstanceId')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit an answer to one of the games' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  @ApiZodBody(submitGameSchema, 'SubmitGame')
  async submitGame(
    @Param('slug') slug: string,
    @Param('gameInstanceId') gameInstanceId: string,
    @Body(zodBody(submitGameSchema)) body: SubmitGameInput,
    @Query('t') token?: string,
  ) {
    const { eventId, guest } = await this.publicEvents.requireAccess(slug, token);
    return this.games.submit(eventId, gameInstanceId, guest?.id ?? null, body);
  }
}
