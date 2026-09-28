import './shared/telemetry/otel'; // DEVE ser o primeiro import
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api', {
    exclude: ['health', 'ready', 'live', 'health/(.*)', 'ready/(.*)'],
  });
  app.enableVersioning();
  app.useGlobalFilters(new HttpExceptionFilter());
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
