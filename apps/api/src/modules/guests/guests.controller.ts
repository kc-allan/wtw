import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { ApiZodBody, ApiZodQuery } from '../../core/http/api-zod';
import { ZodValidationPipe, zodBody } from '../../core/http/zod-validation.pipe';
import {
  bulkGuestsSchema,
  guestSchema,
  listGuestsSchema,
  updateGuestSchema,
  type BulkGuestsInput,
  type GuestInput,
  type ListGuestsQuery,
  type UpdateGuestInput,
} from './guests.schemas';
import { GuestsService } from './guests.service';

@ApiTags('guests')
@ApiBearerAuth()
@Controller('events/:eventId/guests')
export class GuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Get()
  @ApiOperation({ summary: 'The guest list with invitation and RSVP state' })
  @ApiZodQuery(listGuestsSchema, 'ListGuests')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Query(new ZodValidationPipe(listGuestsSchema)) query: ListGuestsQuery,
  ) {
    return this.guests.list(user.id, eventId, query);
  }

  @Post()
  @ApiZodBody(guestSchema, 'CreateGuest')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body(zodBody(guestSchema)) body: GuestInput,
  ) {
    return this.guests.create(user.id, eventId, body);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Add many guests at once' })
  @ApiZodBody(bulkGuestsSchema, 'BulkGuests')
  createMany(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body(zodBody(bulkGuestsSchema)) body: BulkGuestsInput,
  ) {
    return this.guests.createMany(user.id, eventId, body);
  }

  @Patch(':guestId')
  @ApiZodBody(updateGuestSchema, 'UpdateGuest')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Body(zodBody(updateGuestSchema)) body: UpdateGuestInput,
  ) {
    return this.guests.update(user.id, eventId, guestId, body);
  }

  @Delete(':guestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
  ): Promise<void> {
    await this.guests.remove(user.id, eventId, guestId);
  }
}
