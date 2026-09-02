import { Injectable } from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface RecordMediaInput {
  accountId: string;
  eventId?: string;
  kind: MediaKind;
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

/**
 * Scaffold. Records uploaded assets so events can reference cover images and
 * gallery photos; the storage integration and signed upload URLs are still to
 * come, which is why nothing here touches a bucket yet.
 */
@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordMediaInput) {
    return this.prisma.mediaAsset.create({ data: input });
  }

  async listForEvent(eventId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.mediaAsset.delete({ where: { id } });
  }
}
