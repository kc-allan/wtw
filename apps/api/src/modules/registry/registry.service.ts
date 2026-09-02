import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventModuleKey } from '@wtw/shared';
import { toDbModuleKey } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type {
  ClaimRegistryItemInput,
  RegistryItemInput,
  UpdateRegistryItemInput,
} from './registry.schemas';

/**
 * Scaffold. The tables, module gating and claim accounting are in place; gift
 * reservation expiry and payment capture are still to come.
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

  /** Called from the guest-facing route once the invitation token is verified. */
  async claim(
    eventId: string,
    itemId: string,
    guestId: string | null,
    input: ClaimRegistryItemInput,
  ) {
    await this.assertModuleEnabled(eventId);
    const item = await this.assertItemBelongs(eventId, itemId);

    const remaining = item.quantity - item.quantityClaimed;
    if (input.quantity > remaining) {
      throw new BadRequestException(
        remaining <= 0 ? 'This gift has already been claimed' : `Only ${remaining} left`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.registryClaim.create({
        data: { registryItemId: itemId, guestId, ...input },
      });
      const claimed = item.quantityClaimed + input.quantity;
      await tx.registryItem.update({
        where: { id: itemId },
        data: {
          quantityClaimed: claimed,
          status: claimed >= item.quantity ? 'purchased' : 'available',
        },
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

  private async assertModuleEnabled(eventId: string): Promise<void> {
    const row = await this.prisma.eventModule.findUnique({
      where: { eventId_key: { eventId, key: toDbModuleKey(EventModuleKey.REGISTRY) } },
      select: { enabled: true },
    });
    if (!row?.enabled) {
      throw new BadRequestException('This event does not have a gift registry');
    }
  }
}
