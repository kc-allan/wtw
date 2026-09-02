import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [EventsModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
