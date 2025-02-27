import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/base-exception.filter';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services/api-config.service';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.use(helmet());
  app.use(morgan('combined'));

  const configService = app.get(ApiConfigService);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix(configService.apiPrefix, {
    exclude: ['/'],
  });

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  if (configService.documentationEnabled) {
    setupSwagger(app);
  }
  if (configService.isNotDevelopment) {
    app.enableShutdownHooks();
  }
  await app.listen(configService.port);
}

void bootstrap();
