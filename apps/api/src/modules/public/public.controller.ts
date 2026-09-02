import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../core/auth/public.decorator';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import { submitRsvpSchema, type SubmitRsvpInput } from '../rsvp/rsvp.schemas';
import { RsvpService } from '../rsvp/rsvp.service';
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
  ) {}

  @Get(':slug')
  @ApiOperation({ summary: 'The public event page with its enabled modules' })
  @ApiQuery({ name: 't', required: false, description: 'Guest invitation token' })
  @ApiQuery({ name: 'code', required: false, description: 'Access code for private events' })
  get(
    @Param('slug') slug: string,
    @Query('t') token?: string,
    @Query('code') code?: string,
  ) {
    return this.publicEvents.getBySlug(slug, token, code);
  }

  @Post(':slug/rsvp')
  @HttpCode(HttpStatus.OK)
  // Guest endpoints are unauthenticated, so they get a tighter budget.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit or update an RSVP using an invitation token' })
  @ApiQuery({ name: 't', required: true, description: 'Guest invitation token' })
  @ApiZodBody(submitRsvpSchema, 'SubmitRsvp')
  async submitRsvp(
    @Param('slug') slug: string,
    @Query('t') token: string,
    @Body(zodBody(submitRsvpSchema)) body: SubmitRsvpInput,
  ) {
    const { eventId, guest } = await this.publicEvents.requireGuest(slug, token);
    return this.rsvp.submit(eventId, guest.id, guest.invitationId, body);
  }
}
