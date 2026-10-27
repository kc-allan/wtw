import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { MEDIA_STORAGE, type MediaStorage, type UploadedFile } from './media.storage';
import type { UpdateMediaInput } from './media.schemas';

/** What a browser may send for a cover photo or a gallery image. */
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStorage,
  ) {}

  /**
   * Stores an image against an event the caller may manage. The row is written
   * only after the bytes land, so a failed write never leaves a dangling asset.
   */
  async uploadForEvent(userId: string, eventId: string, file: UploadedFile) {
    const event = await this.events.assertCanManage(userId, eventId);

    if (!ALLOWED_IMAGE_TYPES.has(file.mimeType) || detectImageType(file.buffer) !== file.mimeType) {
      throw new BadRequestException('Upload a JPEG, PNG, WebP, AVIF or GIF image');
    }

    const stored = await this.storage.save(file);

    const last = await this.prisma.mediaAsset.aggregate({
      where: { eventId },
      _max: { position: true },
    });

    return this.prisma.mediaAsset.create({
      data: {
        accountId: event.accountId,
        eventId,
        kind: MediaKind.image,
        url: stored.url,
        position: (last._max.position ?? -1) + 1,
        storageKey: stored.storageKey,
        mimeType: file.mimeType,
        sizeBytes: stored.sizeBytes,
      },
    });
  }

  async listForEvent(userId: string, eventId: string) {
    await this.events.assertCanManage(userId, eventId);
    const assets = await this.prisma.mediaAsset.findMany({
      where: { eventId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
    return Promise.all(assets.map(async (asset) => ({ ...asset, url: await this.storage.url(asset.storageKey) })));
  }

  async update(userId: string, eventId: string, id: string, input: UpdateMediaInput) {
    await this.events.assertCanManage(userId, eventId);
    await this.assertBelongs(eventId, id);

    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(input.caption !== undefined ? { caption: input.caption?.trim() || null } : {}),
        ...(input.altText !== undefined ? { altText: input.altText?.trim() || null } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
        ...(input.isHidden !== undefined ? { isHidden: input.isHidden } : {}),
      },
    });
  }

  async remove(userId: string, eventId: string, id: string): Promise<void> {
    await this.events.assertCanManage(userId, eventId);

    const asset = await this.assertBelongs(eventId, id);

    // Clear the reference first: an event pointing at a deleted file renders a
    // broken cover, which is worse than an orphaned byte range on disk.
    await this.prisma.event.updateMany({
      where: { id: eventId, coverImageId: id },
      data: { coverImageId: null },
    });
    await this.prisma.mediaAsset.delete({ where: { id } });
    await this.storage.remove(asset.storageKey);
  }

  private async assertBelongs(eventId: string, id: string) {
    const asset = await this.prisma.mediaAsset.findFirst({ where: { id, eventId } });
    if (!asset) {
      throw new NotFoundException('Image not found on this event');
    }
    return asset;
  }
}

function detectImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buffer.length >= 6 && /^GIF8[79]a$/.test(buffer.toString('ascii', 0, 6))) return 'image/gif';
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (['avif', 'avis'].includes(brand)) return 'image/avif';
  }
  return null;
}
