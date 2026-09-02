import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /** The workspaces a host belongs to, with their role in each. */
  async listForUser(userId: string) {
    const memberships = await this.prisma.accountMember.findMany({
      where: { userId },
      select: {
        role: true,
        account: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            createdAt: true,
            _count: { select: { events: true, members: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map(({ role, account }) => ({ role, ...account }));
  }

  async findForUser(userId: string, accountId: string) {
    const membership = await this.prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId, userId } },
      select: {
        role: true,
        account: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            createdAt: true,
            members: {
              select: {
                role: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Workspace not found');
    }
    return { role: membership.role, ...membership.account };
  }
}
