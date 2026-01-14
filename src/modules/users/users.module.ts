import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailService } from '@/modules/auth/email.service';
import { JwtModule } from '@/common/utils/jwt/jwt.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { CountriesModule } from '../countries/countries.module';
import { EmailModule } from '@/common/utils/email/email.module';

@Module({
  imports: [
    JwtModule,
    OrganizationsModule,
    CountriesModule,
    EmailModule
  ],
  providers: [UsersService, EmailService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
