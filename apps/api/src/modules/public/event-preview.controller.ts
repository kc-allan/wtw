import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventModuleKey } from '@wtw/shared';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { EventsService } from '../events/events.service';
import { GamesService } from '../games/games.service';
import { RegistryService } from '../registry/registry.service';
import { PublicEventsService } from './public-events.service';

/**
 * A host looking at their own event exactly as a guest will, before anyone
 * else can reach it. Publishing is what opens an event up, so without this a
 * host cannot see their work until it is already public.
 */
@ApiTags('events')
@ApiBearerAuth()
@Controller('events/:eventId/preview')
export class EventPreviewController {
  constructor(
    private readonly events: EventsService,
    private readonly publicEvents: PublicEventsService,
    private readonly games: GamesService,
    private readonly registry: RegistryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'The guest-facing page of an event, published or not' })
  async preview(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Query('guestId') guestId?: string,
  ) {
    await this.events.assertCanManage(user.id, eventId);

    const view = await this.publicEvents.previewForHost(eventId, guestId);
    const enabled = new Set(view.modules.map((module) => module.key));

    const [registry, gallery, games] = await Promise.all([
      enabled.has(EventModuleKey.REGISTRY)
        ? this.registry.listForGuests(eventId).catch(() => null)
        : null,
      enabled.has(EventModuleKey.GALLERY) ? this.publicEvents.gallery(eventId) : null,
      enabled.has(EventModuleKey.GAMES)
        ? this.games.listForGuests(eventId).catch(() => [] as Awaited<ReturnType<GamesService['listForGuests']>>)
        : [],
    ]);

    return { ...view, registry, gallery, games };
  }
}
