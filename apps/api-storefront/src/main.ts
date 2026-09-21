import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('StorefrontBffBootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://newdawn.diskingressos.com.br',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Documentação OpenAPI para o time do Storefront (apps/storefront)
  const config = new DocumentBuilder()
    .setTitle('DiskIngressos Storefront BFF')
    .setDescription(
      'API pública para o site de vendas (newdawn.diskingressos.com.br). Somente leitura de catálogo e checkout.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.STOREFRONT_PORT || 4000;
  await app.listen(port);
  logger.log(`🛒 Storefront BFF is running on http://localhost:${port}`);
  logger.log(`📖 Storefront OpenAPI Docs available at http://localhost:${port}/docs`);
}

bootstrap();
