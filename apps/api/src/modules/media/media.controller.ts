import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile as UploadedFileParam,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import type { Env } from '../../core/config/env';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import { updateMediaSchema, type UpdateMediaInput } from './media.schemas';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiBearerAuth()
@Controller('events/:eventId/media')
export class MediaController {
  constructor(
    private readonly media: MediaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Images uploaded to this event' })
  list(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.media.listForEvent(user.id, eventId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a cover or gallery image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @UploadedFileParam() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Choose an image to upload');
    }

    // Checked here rather than in the interceptor so the reason reaches the
    // client as a message instead of an unexplained 413.
    const limit = this.config.get('MEDIA_MAX_BYTES', { infer: true });
    if (file.size > limit) {
      throw new BadRequestException(
        `Images must be under ${Math.floor(limit / (1024 * 1024))}MB`,
      );
    }

    return this.media.uploadForEvent(user.id, eventId, {
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update image caption, alt text, order or visibility' })
  @ApiZodBody(updateMediaSchema, 'UpdateMedia')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body(zodBody(updateMediaSchema)) body: UpdateMediaInput,
  ) {
    return this.media.update(user.id, eventId, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an image' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
  ) {
    return this.media.remove(user.id, eventId, id);
  }
}
