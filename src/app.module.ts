import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { WebinarsModule } from './modules/webinars/webinars.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminsModule } from './modules/admins/admins.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    WebinarsModule,
    OrganizationsModule,
    NotificationsModule,
    AuthModule,
    AdminsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
