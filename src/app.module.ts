import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { WebinarsModule } from './modules/webinars/webinars.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminsModule } from './modules/admins/admins.module';
import { CacheModule } from './cache/cache.module';
import { CountriesModule } from './modules/countries/countries.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Database module
    DatabaseModule,
    // Cache module
    CacheModule,

    // Application Business Modules
    UsersModule,
    WebinarsModule,
    OrganizationsModule,
    NotificationsModule,
    AuthModule,
    AdminsModule,
    CountriesModule,
    CategoriesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
