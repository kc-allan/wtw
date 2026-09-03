import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { MEDIA_STORAGE, type MediaStorage, type UploadedFile } from './media.storage';

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

    if (!ALLOWED_IMAGE_TYPES.has(file.mimeType)) {
      throw new BadRequestException('Upload a JPEG, PNG, WebP, AVIF or GIF image');
    }

    const stored = await this.storage.save(file);

    return this.prisma.mediaAsset.create({
      data: {
        accountId: event.accountId,
        eventId,
        kind: MediaKind.image,
        url: stored.url,
        storageKey: stored.storageKey,
        mimeType: file.mimeType,
        sizeBytes: stored.sizeBytes,
      },
    });
  }

  async listForEvent(userId: string, eventId: string) {
    await this.events.assertCanManage(userId, eventId);
    return this.prisma.mediaAsset.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, eventId: string, id: string): Promise<void> {
    await this.events.assertCanManage(userId, eventId);

    const asset = await this.prisma.mediaAsset.findFirst({ where: { id, eventId } });
    if (!asset) {
      throw new NotFoundException('Image not found on this event');
    }

    // Clear the reference first: an event pointing at a deleted file renders a
    // broken cover, which is worse than an orphaned byte range on disk.
    await this.prisma.event.updateMany({
      where: { id: eventId, coverImageId: id },
      data: { coverImageId: null },
    });
    await this.prisma.mediaAsset.delete({ where: { id } });
    await this.storage.remove(asset.storageKey);
  }
}
