import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegistryItemStatus } from '@prisma/client';
import { EventModuleKey, parseModuleConfig } from '@wtw/shared';
import { toDbModuleKey } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type {
  ClaimRegistryItemInput,
  RegistryItemInput,
  UpdateRegistryItemInput,
} from './registry.schemas';

/** A gift is reserved once someone has taken part of it, purchased at capacity. */
function statusFor(claimed: number, quantity: number): RegistryItemStatus {
  if (claimed >= quantity) return RegistryItemStatus.purchased;
  return claimed > 0 ? RegistryItemStatus.reserved : RegistryItemStatus.available;
}

/**
 * Gift registry for the events whose type allows one. Claim accounting is
 * atomic; cash gifts are recorded against a claim but payment capture waits on
 * the payments module.
 */
@Injectable()
export class RegistryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async list(eventId: string) {
    await this.assertModuleEnabled(eventId);
    return this.prisma.registryItem.findMany({
      where: { eventId },
      orderBy: { position: 'asc' },
    });
  }

  async create(userId: string, eventId: string, input: RegistryItemInput) {
    await this.events.assertCanManage(userId, eventId);
    await this.assertModuleEnabled(eventId);
    return this.prisma.registryItem.create({ data: { eventId, ...input } });
  }

  async update(
    userId: string,
    eventId: string,
    itemId: string,
    input: UpdateRegistryItemInput,
  ) {
    await this.events.assertCanManage(userId, eventId);
    await this.assertItemBelongs(eventId, itemId);
    return this.prisma.registryItem.update({ where: { id: itemId }, data: input });
  }

  async remove(userId: string, eventId: string, itemId: string): Promise<void> {
    await this.events.assertCanManage(userId, eventId);
    await this.assertItemBelongs(eventId, itemId);
    await this.prisma.registryItem.delete({ where: { id: itemId } });
  }

  /**
   * What guests see. Fully claimed gifts drop out when the host has asked for
   * that, so the list stops advertising things nobody can give.
   */
  async listForGuests(eventId: string) {
    const config = await this.assertModuleEnabled(eventId);
    const items = await this.prisma.registryItem.findMany({
      where: {
        eventId,
        ...(config.hideClaimedItems
          ? { status: { not: RegistryItemStatus.purchased } }
          : {}),
      },
      orderBy: { position: 'asc' },
    });

    return {
      allowCashGifts: config.allowCashGifts,
      cashGiftNote: config.cashGiftNote ?? null,
      externalRegistries: config.externalRegistries,
      currency: config.currency,
      items: items.map((item) => ({
        ...item,
        remaining: Math.max(0, item.quantity - item.quantityClaimed),
      })),
    };
  }

  /** Called from the guest-facing routes once event access has been checked. */
  async claim(
    eventId: string,
    itemId: string,
    guestId: string | null,
    input: ClaimRegistryItemInput,
  ) {
    await this.assertModuleEnabled(eventId);
    await this.assertItemBelongs(eventId, itemId);

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.registryItem.findUniqueOrThrow({
        where: { id: itemId },
        select: { quantity: true, quantityClaimed: true },
      });

      // The guard travels with the write: Postgres re-checks it against the
      // locked row, so two guests claiming the last one cannot both succeed.
      const { count } = await tx.registryItem.updateMany({
        where: {
          id: itemId,
          quantityClaimed: { lte: item.quantity - input.quantity },
        },
        data: { quantityClaimed: { increment: input.quantity } },
      });

      if (count === 0) {
        const remaining = item.quantity - item.quantityClaimed;
        throw new BadRequestException(
          remaining <= 0 ? 'This gift has already been claimed' : `Only ${remaining} left`,
        );
      }

      const claim = await tx.registryClaim.create({
        data: { registryItemId: itemId, guestId, ...input },
      });

      const claimed = item.quantityClaimed + input.quantity;
      await tx.registryItem.update({
        where: { id: itemId },
        data: { status: statusFor(claimed, item.quantity) },
      });

      return claim;
    });
  }

  private async assertItemBelongs(eventId: string, itemId: string) {
    const item = await this.prisma.registryItem.findFirst({ where: { id: itemId, eventId } });
    if (!item) {
      throw new NotFoundException('Registry item not found on this event');
    }
    return item;
  }

  private async assertModuleEnabled(eventId: string) {
    const row = await this.prisma.eventModule.findUnique({
      where: { eventId_key: { eventId, key: toDbModuleKey(EventModuleKey.REGISTRY) } },
      select: { enabled: true, config: true },
    });
    if (!row?.enabled) {
      throw new BadRequestException('This event does not have a gift registry');
    }
    return parseModuleConfig(EventModuleKey.REGISTRY, row.config);
  }
}
