import { Global, Module } from '@nestjs/common';
import { redisProvider } from './cache.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
   imports: [ConfigModule],
   providers: [redisProvider],
   exports: [redisProvider],
})
export class CacheModule {};
