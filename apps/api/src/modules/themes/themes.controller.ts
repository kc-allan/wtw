import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/public.decorator';
import { ApiZodQuery } from '../../core/http/api-zod';
import { ZodValidationPipe } from '../../core/http/zod-validation.pipe';
import { listThemesSchema, type ListThemesQuery } from './themes.schemas';
import { ThemesService } from './themes.service';

@ApiTags('themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themes: ThemesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse the theme catalogue' })
  @ApiZodQuery(listThemesSchema, 'ListThemes')
  list(@Query(new ZodValidationPipe(listThemesSchema)) query: ListThemesQuery) {
    return this.themes.list(query);
  }

  @Public()
  @Get('grouped')
  @ApiOperation({ summary: 'The catalogue split into picker groups' })
  @ApiZodQuery(listThemesSchema, 'ListThemesGrouped')
  listGrouped(@Query(new ZodValidationPipe(listThemesSchema)) query: ListThemesQuery) {
    return this.themes.listGrouped(query);
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'A single theme' })
  findOne(@Param('key') key: string) {
    return this.themes.findByKey(key);
  }
}
