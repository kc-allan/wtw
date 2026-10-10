import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { ContactInput } from './contact.schemas';

/** Enquiries from the About page, stored durably for beta support review. */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submit(input: ContactInput): Promise<{ received: true; id: string }> {
    const enquiry = await this.prisma.contactEnquiry.create({
      data: {
        name: input.name,
        contact: input.contact,
        planning: input.planning ?? null,
        message: input.message,
      },
      select: { id: true },
    });
    this.logger.log({
      message: 'Contact enquiry received',
      id: enquiry.id,
      name: input.name,
      contact: input.contact,
      planning: input.planning ?? null,
      body: input.message,
      receivedAt: new Date().toISOString(),
    });
    return { received: true, id: enquiry.id };
  }
}
