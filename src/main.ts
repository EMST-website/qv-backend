import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { XTotalCountInterceptor } from './common/interceptors/x-total-count.interceptor';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new XTotalCountInterceptor());
  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
  });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('QV API')
    .setDescription('QV Mobile Application API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
