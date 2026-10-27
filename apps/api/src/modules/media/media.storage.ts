import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../core/config/env';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
  url(storageKey: string): Promise<string>;
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

  url(storageKey: string): Promise<string> {
    return Promise.resolve(`${this.publicPath}/${encodeURIComponent(storageKey)}`);
  }
}

/** R2 uses the S3 API with private-by-default objects and short-lived reads. */
@Injectable()
export class R2Storage implements MediaStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly ttl: number;

  constructor(@Inject(ConfigService) config: ConfigService<Env, true>) {
    const accountId = config.get('R2_ACCOUNT_ID', { infer: true }) ?? '';
    this.bucket = config.get('R2_BUCKET', { infer: true })!;
    this.ttl = config.get('MEDIA_SIGNED_URL_TTL_SECONDS', { infer: true });
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get('R2_ACCESS_KEY_ID', { infer: true }) ?? '',
        secretAccessKey: config.get('R2_SECRET_ACCESS_KEY', { infer: true }) ?? '',
      },
    });
  }

  async save(file: UploadedFile): Promise<StoredFile> {
    const extension = extname(file.originalName).toLowerCase().slice(0, 10);
    const storageKey = `${randomUUID()}${/^\.[a-z0-9]+$/.test(extension) ? extension : ''}`;
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: file.buffer,
      ContentType: file.mimeType,
      CacheControl: 'private, max-age=0, no-store',
    }));
    return { storageKey, url: '', sizeBytes: file.buffer.byteLength };
  }

  async remove(storageKey: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }));
  }

  async url(storageKey: string): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }), { expiresIn: this.ttl });
  }
}
