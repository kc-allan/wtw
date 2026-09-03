import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../core/config/env';

export interface StoredFile {
  storageKey: string;
  url: string;
  sizeBytes: number;
}

export interface UploadedFile {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

/**
 * Where uploaded files live. Swapping local disk for S3 or Cloudinary later is
 * a second implementation of this token, not a change to the callers.
 */
export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE');

export interface MediaStorage {
  save(file: UploadedFile): Promise<StoredFile>;
  remove(storageKey: string): Promise<void>;
}

/**
 * Development storage: files under a directory the API serves statically. Keys
 * are random, so an uploaded name never becomes a path and never collides.
 */
@Injectable()
export class LocalDiskStorage implements MediaStorage {
  private readonly root: string;
  private readonly publicPath: string;

  constructor(@Inject(ConfigService) config: ConfigService<Env, true>) {
    this.root = resolve(config.get('MEDIA_STORAGE_DIR', { infer: true }));
    this.publicPath = config.get('MEDIA_PUBLIC_PATH', { infer: true });
  }

  async save(file: UploadedFile): Promise<StoredFile> {
    // Take the extension from the name but keep nothing else from it.
    const extension = extname(file.originalName).toLowerCase().slice(0, 10);
    const storageKey = `${randomUUID()}${/^\.[a-z0-9]+$/.test(extension) ? extension : ''}`;

    await mkdir(this.root, { recursive: true });
    await writeFile(join(this.root, storageKey), file.buffer);

    return {
      storageKey,
      url: `${this.publicPath}/${storageKey}`,
      sizeBytes: file.buffer.byteLength,
    };
  }

  async remove(storageKey: string): Promise<void> {
    try {
      await unlink(join(this.root, storageKey));
    } catch (error) {
      // A missing file is the state the caller wanted; anything else is real.
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
