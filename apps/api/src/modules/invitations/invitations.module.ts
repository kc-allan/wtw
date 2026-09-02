import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { InvitationSender, LoggingInvitationSender } from './invitation-sender';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [EventsModule],
  controllers: [InvitationsController],
  providers: [
    InvitationsService,
    // Swap this binding for a WhatsApp/SMS provider without touching callers.
    { provide: InvitationSender, useClass: LoggingInvitationSender },
  ],
  exports: [InvitationsService],
})
export class InvitationsModule {}
