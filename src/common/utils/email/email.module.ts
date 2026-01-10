import { EmailService } from './email.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


@Module({
   imports: [ConfigModule],
   providers: [EmailService],
   exports: [EmailService],
})
export class EmailModule {};