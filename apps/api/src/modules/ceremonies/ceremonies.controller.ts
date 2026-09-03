import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import {
  setCeremoniesSchema,
  updateCeremonySchema,
  type SetCeremoniesInput,
  type UpdateCeremonyInput,
} from './ceremonies.schemas';
import { CeremoniesService } from './ceremonies.service';

@ApiTags('ceremonies')
@ApiBearerAuth()
@Controller('events/:eventId/ceremonies')
export class CeremoniesController {
  constructor(private readonly ceremonies: CeremoniesService) {}

  @Get()
  @ApiOperation({ summary: 'The gatherings this event is made up of' })
  list(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.ceremonies.list(user.id, eventId);
  }

  @Put()
  @ApiOperation({ summary: 'Replace the set of ceremonies, keeping the ones held on to' })
  @ApiZodBody(setCeremoniesSchema, 'SetCeremonies')
  set(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body(zodBody(setCeremoniesSchema)) body: SetCeremoniesInput,
  ) {
    return this.ceremonies.set(user.id, eventId, body);
  }

  @Patch(':ceremonyId')
  @ApiOperation({ summary: 'The date, place and design of one ceremony' })
  @ApiZodBody(updateCeremonySchema, 'UpdateCeremony')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('ceremonyId') ceremonyId: string,
    @Body(zodBody(updateCeremonySchema)) body: UpdateCeremonyInput,
  ) {
    return this.ceremonies.update(user.id, eventId, ceremonyId, body);
  }
}
