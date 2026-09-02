import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { RsvpModule } from '../rsvp/rsvp.module';
import { PublicController } from './public.controller';
import { PublicEventsService } from './public-events.service';

@Module({
  imports: [EventsModule, RsvpModule],
  controllers: [PublicController],
  providers: [PublicEventsService],
  exports: [PublicEventsService],
})
export class PublicModule {}
