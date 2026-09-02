import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toDbEventType, toDbVendorCategory } from '../../core/prisma/enums';
import { PrismaService } from '../../core/prisma/prisma.service';
import { paginate, skipTake, type Paginated } from '../../common/pagination';
import type { ListVendorsQuery } from './vendors.schemas';

const vendorSelect = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  categories: true,
  eventTypes: true,
  city: true,
  county: true,
  priceFrom: true,
  currency: true,
  logoUrl: true,
  coverImageUrl: true,
  rating: true,
  reviewCount: true,
  isFeatured: true,
} satisfies Prisma.VendorSelect;

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListVendorsQuery): Promise<Paginated<unknown>> {
    const where: Prisma.VendorWhereInput = {
      status: 'approved',
      // hasSome, not equals: one profile serves every category it selects.
      ...(query.category?.length
        ? { categories: { hasSome: query.category.map(toDbVendorCategory) } }
        : {}),
      ...(query.eventType?.length
        ? { eventTypes: { hasSome: query.eventType.map(toDbEventType) } }
        : {}),
      ...(query.county ? { county: { equals: query.county, mode: 'insensitive' } } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { tagline: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.VendorOrderByWithRelationInput[] = [
      ...(query.featuredFirst ? [{ isFeatured: 'desc' as const }] : []),
      { rating: 'desc' as const },
      { name: 'asc' as const },
    ];

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.vendor.findMany({ where, select: vendorSelect, orderBy, ...skipTake(query) }),
      this.prisma.vendor.count({ where }),
    ]);

    return paginate(rows, total, query);
  }

  async findBySlug(slug: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { slug },
      include: {
        reviews: {
          select: { authorName: true, rating: true, body: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!vendor || vendor.status !== 'approved') {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }
}
