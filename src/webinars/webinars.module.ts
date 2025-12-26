import { Module } from '@nestjs/common';
import { WebinarsService } from './webinars.service';
import { WebinarsController } from './webinars.controller';

@Module({
  providers: [WebinarsService],
  controllers: [WebinarsController]
})
export class WebinarsModule {}
