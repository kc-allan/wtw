import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { GamesModule } from '../games/games.module';
import { RegistryModule } from '../registry/registry.module';
import { RsvpModule } from '../rsvp/rsvp.module';
import { MediaModule } from '../media/media.module';
import { EventPreviewController } from './event-preview.controller';
import { PublicController } from './public.controller';
import { PublicEventsService } from './public-events.service';

@Module({
  imports: [EventsModule, RsvpModule, RegistryModule, GamesModule, MediaModule],
  controllers: [PublicController, EventPreviewController],
  providers: [PublicEventsService],
  exports: [PublicEventsService],
})
export class PublicModule {}
