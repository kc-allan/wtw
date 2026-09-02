import { Module } from '@nestjs/common';
import { ThemesModule } from '../themes/themes.module';
import { EventModulesService } from './event-modules.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [ThemesModule],
  controllers: [EventsController],
  providers: [EventsService, EventModulesService],
  exports: [EventsService, EventModulesService],
})
export class EventsModule {}
