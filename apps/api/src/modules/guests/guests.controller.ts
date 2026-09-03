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
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
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
import { toCsv } from '../../common/csv';
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

  @Get('groups')
  @ApiOperation({ summary: 'Group labels in use on this event' })
  groups(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.guests.groups(user.id, eventId);
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'The guest list as a spreadsheet' })
  @ApiZodQuery(listGuestsSchema, 'ListGuests')
  async exportCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Query(new ZodValidationPipe(listGuestsSchema)) query: ListGuestsQuery,
    @Res() res: Response,
  ): Promise<void> {
    const rows = await this.guests.exportRows(user.id, eventId, query);

    res
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="guest-list.csv"')
      .send(
        toCsv(rows, [
          'name',
          'email',
          'phone',
          'group',
          'rsvp',
          'party',
          'meal',
          'dietaryNotes',
          'invitedTo',
          'invitedVia',
          'invitationStatus',
        ]),
      );
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
