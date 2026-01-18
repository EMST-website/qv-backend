import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { DatabaseModule } from '@/database/database.module';
import { JwtModule } from '@/common/utils/jwt/jwt.module';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
