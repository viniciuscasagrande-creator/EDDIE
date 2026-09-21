import { Module } from '@nestjs/common';
import { EventosController } from './eventos.controller';
import { EventosService } from './eventos.service';
import { EventosPublicService } from './eventos.public-service';
import { EventosConsumer } from './eventos.consumer';

@Module({
  controllers: [EventosController],
  providers: [EventosService, EventosPublicService, EventosConsumer],
  // Porta pública: é ISTO que outros módulos podem importar. Nunca o service interno.
  exports: [EventosPublicService],
})
export class EventosModule {}
