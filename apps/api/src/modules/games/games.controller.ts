import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { Public } from '../../core/auth/public.decorator';
import { GamesService } from './games.service';

@ApiTags('games')
@Controller()
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Public()
  @Get('games')
  @ApiOperation({ summary: 'Every game that can be switched on' })
  catalogue() {
    return this.games.catalogue();
  }

  @ApiBearerAuth()
  @Get('events/:eventId/games/responses')
  @ApiOperation({ summary: 'Export what guests submitted' })
  responses(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.games.responses(user.id, eventId);
  }
}
