import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { FactoryProvider } from '@nestjs/common';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: FactoryProvider = {
   provide: REDIS_CLIENT,
   useFactory: async (configService: ConfigService) => {
      const redis = new Redis({
         host: configService.get<string>('REDIS_HOST') || 'localhost',
         port: Number(configService.get<string>('REDIS_PORT')) || 6379,
         password: configService.get<string>('REDIS_PASSWORD') || undefined,
         lazyConnect: true,
      });

      try {
         await redis.connect();
         const pong = await redis.ping();
         if (pong === 'PONG') {
            console.log(`✅ Redis cache connection established successfully (${configService.get<string>('REDIS_HOST')}:${configService.get<string>('REDIS_PORT')})`);
         }
      } catch (error) {
         console.error(`❌ Redis cache connection failed (${configService.get<string>('REDIS_HOST')}:${configService.get<string>('REDIS_PORT')}):`, error.message);
         throw error;
      }

      return (redis);
   },
   inject: [ConfigService],
};
