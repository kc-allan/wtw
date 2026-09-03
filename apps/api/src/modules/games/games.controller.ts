import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { Public } from '../../core/auth/public.decorator';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import { stringifyCell, toCsv } from '../../common/csv';
import { GamesService } from './games.service';
import {
  addGameSchema,
  updateGameSchema,
  type AddGameInput,
  type UpdateGameInput,
} from './games.schemas';

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
  @Get('events/:eventId/games')
  @ApiOperation({ summary: 'Games the host has set up, enabled or not' })
  list(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.games.listForHost(user.id, eventId);
  }

  @ApiBearerAuth()
  @Post('events/:eventId/games')
  @ApiOperation({ summary: 'Add a game to the event' })
  @ApiZodBody(addGameSchema, 'AddGame')
  add(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body(zodBody(addGameSchema)) body: AddGameInput,
  ) {
    return this.games.add(user.id, eventId, body);
  }

  @ApiBearerAuth()
  @Patch('events/:eventId/games/:gameInstanceId')
  @ApiOperation({ summary: "Change a game's questions, order or whether it runs" })
  @ApiZodBody(updateGameSchema, 'UpdateGame')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('gameInstanceId') gameInstanceId: string,
    @Body(zodBody(updateGameSchema)) body: UpdateGameInput,
  ) {
    return this.games.update(user.id, eventId, gameInstanceId, body);
  }

  @ApiBearerAuth()
  @Delete('events/:eventId/games/:gameInstanceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a game and its submissions' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('gameInstanceId') gameInstanceId: string,
  ) {
    return this.games.remove(user.id, eventId, gameInstanceId);
  }

  @ApiBearerAuth()
  @Get('events/:eventId/games/responses')
  @ApiOperation({ summary: 'Export what guests submitted' })
  responses(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.games.responses(user.id, eventId);
  }

  @ApiBearerAuth()
  @Get('events/:eventId/games/responses.csv')
  @ApiOperation({ summary: 'The same responses as a spreadsheet' })
  async responsesCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ): Promise<void> {
    const games = await this.games.responses(user.id, eventId);

    // One row per submission, with the answer flattened so a spreadsheet can
    // read it without the reader unpicking JSON.
    const rows = games.flatMap((game) =>
      game.submissions.map((submission) => ({
        game: game.name,
        guest: submission.guestName,
        answer: formatAnswer(submission.payload),
        submittedAt: submission.createdAt.toISOString(),
      })),
    );

    res
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="game-responses.csv"')
      .send(toCsv(rows, ['game', 'guest', 'answer', 'submittedAt']));
  }
}

/** Renders a submission payload as one readable cell. */
function formatAnswer(payload: unknown): string {
  if (payload === null || typeof payload !== 'object') {
    return stringifyCell(payload);
  }
  return Object.entries(payload as Record<string, unknown>)
    .map(([key, value]) =>
      // The single-answer games read better without their field name repeated.
      key === 'text' || key === 'guess'
        ? stringifyCell(value)
        : `${key}: ${stringifyCell(value)}`,
    )
    .join('; ');
}
