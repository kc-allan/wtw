import { Injectable, Logger } from '@nestjs/common';
import { InvitationChannel } from '@wtw/shared';

export interface InvitationMessage {
  channel: InvitationChannel;
  to: string;
  guestName: string;
  eventTitle: string;
  link: string;
}

/**
 * Delivery is deliberately behind an interface: WhatsApp is the channel that
 * matters most here and will arrive as a provider integration, but nothing
 * upstream should have to change when it does.
 */
export abstract class InvitationSender {
  abstract send(message: InvitationMessage): Promise<void>;
}

/** Development implementation — records what would have been sent. */
@Injectable()
export class LoggingInvitationSender extends InvitationSender {
  private readonly logger = new Logger(LoggingInvitationSender.name);

  send(message: InvitationMessage): Promise<void> {
    this.logger.log(
      `[${message.channel}] to ${message.to || message.guestName}: ${message.eventTitle} — ${message.link}`,
    );
    return Promise.resolve();
  }
}
