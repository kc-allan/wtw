import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { LocalDiskStorage, MEDIA_STORAGE } from './media.storage';

@Module({
  imports: [EventsModule],
  controllers: [MediaController],
  providers: [MediaService, { provide: MEDIA_STORAGE, useClass: LocalDiskStorage }],
  exports: [MediaService],
})
export class MediaModule {}
