import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VENDOR_CATEGORIES } from '@wtw/shared';
import { Public } from '../../core/auth/public.decorator';
import { ApiZodQuery } from '../../core/http/api-zod';
import { ZodValidationPipe } from '../../core/http/zod-validation.pipe';
import { listVendorsSchema, type ListVendorsQuery } from './vendors.schemas';
import { VendorsService } from './vendors.service';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendors: VendorsService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'The vendor category list' })
  categories() {
    return Object.values(VENDOR_CATEGORIES);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search the vendor directory' })
  @ApiZodQuery(listVendorsSchema, 'ListVendors')
  list(@Query(new ZodValidationPipe(listVendorsSchema)) query: ListVendorsQuery) {
    return this.vendors.list(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'A vendor profile' })
  findOne(@Param('slug') slug: string) {
    return this.vendors.findBySlug(slug);
  }
}
