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
import { EventModuleKey } from '@wtw/shared';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { ApiZodBody, ApiZodQuery } from '../../core/http/api-zod';
import { ZodValidationPipe, zodBody } from '../../core/http/zod-validation.pipe';
import {
  createEventSchema,
  listEventsSchema,
  moduleKeyParamSchema,
  updateEventSchema,
  updateModuleSchema,
  type CreateEventInput,
  type ListEventsQuery,
  type UpdateEventInput,
  type UpdateModuleInput,
} from './events.schemas';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event with its type default modules' })
  @ApiZodBody(createEventSchema, 'CreateEvent')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodBody(createEventSchema)) body: CreateEventInput,
  ) {
    return this.events.create(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Events in the workspaces this host belongs to' })
  @ApiZodQuery(listEventsSchema, 'ListEvents')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(listEventsSchema)) query: ListEventsQuery,
  ) {
    return this.events.list(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One event with its modules' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.events.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiZodBody(updateEventSchema, 'UpdateEvent')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(zodBody(updateEventSchema)) body: UpdateEventInput,
  ) {
    return this.events.update(user.id, id, body);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Make the event page live' })
  publish(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.events.publish(user.id, id);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  unpublish(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.events.unpublish(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    await this.events.remove(user.id, id);
  }

  @Get(':id/modules')
  @ApiOperation({ summary: 'Modules available to this event and their settings' })
  listModules(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.events.listModules(user.id, id);
  }

  @Patch(':id/modules/:moduleKey')
  @ApiOperation({ summary: 'Enable, reorder or configure one module' })
  @ApiZodBody(updateModuleSchema, 'UpdateModule')
  updateModule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('moduleKey', new ZodValidationPipe(moduleKeyParamSchema)) moduleKey: EventModuleKey,
    @Body(zodBody(updateModuleSchema)) body: UpdateModuleInput,
  ) {
    return this.events.updateModule(user.id, id, moduleKey, body);
  }
}
