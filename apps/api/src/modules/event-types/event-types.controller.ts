import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/public.decorator';
import { EventTypesService } from './event-types.service';

@ApiTags('event-types')
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypes: EventTypesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Every event type and the modules it supports' })
  list() {
    return this.eventTypes.list();
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'One event type with its module slots' })
  findOne(@Param('key') key: string) {
    return this.eventTypes.findOne(key);
  }
}
