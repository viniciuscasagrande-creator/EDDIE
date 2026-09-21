import './shared/telemetry/otel'; // DEVE ser o primeiro import
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api');
  app.enableVersioning();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? '*', credentials: true });

  const config = new DocumentBuilder()
    .setTitle('DiskIngressos PDT API')
    .setDescription('ERP + CRM para venda de ingressos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3333);
  await app.listen(port);
  Logger.log(`API em http://localhost:${port} — docs em /docs`, 'Bootstrap');
}
void bootstrap();
