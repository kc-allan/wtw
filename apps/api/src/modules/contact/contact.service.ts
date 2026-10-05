import { Injectable, Logger } from '@nestjs/common';
import type { ContactInput } from './contact.schemas';

/**
 * Enquiries from the About page. Delivery is stubbed the same way invitation
 * sending is: bind a mail provider here and the form starts reaching a human
 * without the route or the page changing.
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  submit(input: ContactInput): { received: true } {
    this.logger.log({
      message: 'Contact enquiry received',
      name: input.name,
      contact: input.contact,
      planning: input.planning ?? null,
      body: input.message,
      receivedAt: new Date().toISOString(),
    });
    return { received: true };
  }
}
