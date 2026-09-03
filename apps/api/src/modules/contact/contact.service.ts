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
    this.logger.log(
      `Enquiry from ${input.name} <${input.contact}>` +
        (input.planning ? ` about a ${input.planning}` : ''),
    );
    return { received: true };
  }
}
