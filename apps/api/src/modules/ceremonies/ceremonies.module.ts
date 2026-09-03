import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { ThemesModule } from '../themes/themes.module';
import { CeremoniesController } from './ceremonies.controller';
import { CeremoniesService } from './ceremonies.service';

@Module({
  imports: [EventsModule, ThemesModule],
  controllers: [CeremoniesController],
  providers: [CeremoniesService],
  exports: [CeremoniesService],
})
export class CeremoniesModule {}
