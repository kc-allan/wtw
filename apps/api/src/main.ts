import { resolve } from 'node:path';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { Env } from './core/config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<Env, true>);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    credentials: true,
  });
  app.enableShutdownHooks();

  // Uploaded images are served straight from disk in development. Behind a
  // bucket this mount goes away and the stored URL points at the CDN instead.
  app.useStaticAssets(resolve(config.get('MEDIA_STORAGE_DIR', { infer: true })), {
    prefix: `${config.get('MEDIA_PUBLIC_PATH', { infer: true })}/`,
    index: false,
    // Keys are content-addressed by a random id, so a URL never changes.
    maxAge: '1y',
    immutable: true,
  });

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Worth The Wait API')
        .setDescription(
          'Plan, celebrate, remember. Events are assembled from modules their event type allows.',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on http://localhost:${port}/api/v1`);
  logger.log(`Docs at http://localhost:${port}/api/docs`);
}

void bootstrap();
