import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { LocalDiskStorage, MEDIA_STORAGE, R2Storage } from './media.storage';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../core/config/env';

@Module({
  imports: [EventsModule],
  controllers: [MediaController],
  providers: [MediaService, {
    provide: MEDIA_STORAGE,
    inject: [ConfigService],
    useFactory: (config: ConfigService<Env, true>) =>
      config.get('MEDIA_STORAGE_DRIVER', { infer: true }) === 'r2'
        ? new R2Storage(config)
        : new LocalDiskStorage(config),
  }],
  exports: [MediaService, MEDIA_STORAGE],
})
export class MediaModule {}
