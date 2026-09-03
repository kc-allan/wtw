import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../core/auth/public.decorator';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import { contactSchema, type ContactInput } from './contact.schemas';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Public()
@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  // Unauthenticated and world-reachable, so it gets a tight budget.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Send an enquiry from the About page' })
  @ApiZodBody(contactSchema, 'Contact')
  submit(@Body(zodBody(contactSchema)) body: ContactInput) {
    return this.contact.submit(body);
  }
}
