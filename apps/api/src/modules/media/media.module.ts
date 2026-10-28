import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../core/config/env';
import { EventsModule } from '../events/events.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { LocalDiskStorage, MEDIA_STORAGE, R2Storage } from './media.storage';

@Module({
  imports: [EventsModule],
  controllers: [MediaController],
  providers: [MediaService, {
    provide: MEDIA_STORAGE,
    inject: [ConfigService],
    useFactory: (config: ConfigService<Env, true>) => {
      const driver = config.get('MEDIA_STORAGE_DRIVER', { infer: true });
      if (driver === 'r2') {
        const mediaDir = resolve(config.get('MEDIA_STORAGE_DIR', { infer: true }));
        if (existsSync(mediaDir) && readdirSync(mediaDir).length > 0) {
          throw new Error('Existing local media files must be migrated before switching MEDIA_STORAGE_DRIVER to r2');
        }
      }
      return driver === 'r2' ? new R2Storage(config) : new LocalDiskStorage(config);
    },
  }],
  exports: [MediaService, MEDIA_STORAGE],
})
export class MediaModule {}
