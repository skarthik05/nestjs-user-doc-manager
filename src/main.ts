import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services/api-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ApiConfigService);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix(configService.apiPrefix, {
    exclude: ['/'],
  });
  if (configService.documentationEnabled) {
    setupSwagger(app);
  }
  if (configService.isNotDevelopment) {
    app.enableShutdownHooks();
  }
  await app.listen(configService.port);
}

void bootstrap();
