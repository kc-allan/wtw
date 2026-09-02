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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import {
  registryItemSchema,
  updateRegistryItemSchema,
  type RegistryItemInput,
  type UpdateRegistryItemInput,
} from './registry.schemas';
import { RegistryService } from './registry.service';

@ApiTags('registry')
@ApiBearerAuth()
@Controller('events/:eventId/registry')
export class RegistryController {
  constructor(private readonly registry: RegistryService) {}

  @Get()
  @ApiOperation({ summary: 'Items on this event registry' })
  list(@Param('eventId') eventId: string) {
    return this.registry.list(eventId);
  }

  @Post()
  @ApiZodBody(registryItemSchema, 'CreateRegistryItem')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body(zodBody(registryItemSchema)) body: RegistryItemInput,
  ) {
    return this.registry.create(user.id, eventId, body);
  }

  @Patch(':itemId')
  @ApiZodBody(updateRegistryItemSchema, 'UpdateRegistryItem')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('itemId') itemId: string,
    @Body(zodBody(updateRegistryItemSchema)) body: UpdateRegistryItemInput,
  ) {
    return this.registry.update(user.id, eventId, itemId, body);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.registry.remove(user.id, eventId, itemId);
  }
}
