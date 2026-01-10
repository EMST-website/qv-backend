import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { EmailModule } from '@/common/utils/email/email.module';
import { JwtModule } from '@/common/utils/jwt/jwt.module';

@Module({
   providers: [AdminsService],
   controllers: [AdminsController],
   imports: [
      EmailModule,
      JwtModule
   ],
})
export class AdminsModule {};
