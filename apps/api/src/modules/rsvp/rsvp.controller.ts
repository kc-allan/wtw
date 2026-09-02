import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { ApiZodQuery } from '../../core/http/api-zod';
import { ZodValidationPipe } from '../../core/http/zod-validation.pipe';
import { listRsvpsSchema, type ListRsvpsQuery } from './rsvp.schemas';
import { RsvpService } from './rsvp.service';

@ApiTags('rsvp')
@ApiBearerAuth()
@Controller('events/:eventId/rsvps')
export class RsvpController {
  constructor(private readonly rsvp: RsvpService) {}

  @Get()
  @ApiOperation({ summary: 'Responses received for this event' })
  @ApiZodQuery(listRsvpsSchema, 'ListRsvps')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Query(new ZodValidationPipe(listRsvpsSchema)) query: ListRsvpsQuery,
  ) {
    return this.rsvp.list(user.id, eventId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Headline counts for the dashboard' })
  summary(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.rsvp.summary(user.id, eventId);
  }
}
