import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { DatabaseModule } from '@/database/database.module';
import { JwtModule } from '@/common/utils/jwt/jwt.module';
import { MediaModule } from '@/common/utils/media/media.module';

@Module({
  imports: [DatabaseModule, JwtModule, MediaModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
