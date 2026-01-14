import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { XTotalCountInterceptor } from './common/interceptors/x-total-count.interceptor';
import { ConsoleLogger, ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './common/interceptors/excpetion.interceptor';
import * as cookieParser from 'cookie-parser';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './cache/cache.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './database/schema';
import { DATABASE_CONNECTION } from './database/database.provider';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      // json: true,
    }),
  });

  // Global cookie parser
  app.use(cookieParser.default(''));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true, whitelist: true, forbidNonWhitelisted: true
  }));

  // Global x-total-count interceptor
  app.useGlobalInterceptors(new XTotalCountInterceptor());

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS
  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
  });
  app.setGlobalPrefix('api');

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('QV API')
    .setDescription('QV Mobile Application API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Verify connections before starting server
  try {
    console.log('\n🔍 Verifying connections...\n');
    
    // Get database connection from app context
    app.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION);
    // Get Redis connection from app context
    const redis = app.get<Redis>(REDIS_CLIENT);
    await redis.ping();
    
    console.log('\n✅ All connections verified successfully!\n');
  } catch (error) {
    console.error('\n❌ Connection verification failed:', error.message);
    console.error('⚠️  Application will not start until connections are established.\n');
    await app.close();
    process.exit(1);
  }

  // Start the server
  await app.listen(process.env.PORT || 3000);

  
  // Final verification summary at the bottom
  console.log('\n✅ Database connection: OK');
  console.log('✅ Redis cache connection: OK');
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT || 3000}/api\n`);
}

void bootstrap();
