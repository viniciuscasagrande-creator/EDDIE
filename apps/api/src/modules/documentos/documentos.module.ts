import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma.module';
import { OutboxModule } from '../../shared/outbox/outbox.module';

import { DOCUMENT_SIGNATURE_PROVIDER } from './providers/signature-provider.interface';
import { EddieInternalSignatureProvider } from './providers/internal-signature.provider';

import { DocumentosService } from './services/documentos.service';
import { AssinaturasService } from './services/assinaturas.service';
import { ContratosService } from './services/contratos.service';
import { ModelosService } from './services/modelos.service';
import { DossieService } from './services/dossie.service';
import { ChecklistService } from './services/checklist.service';
import { DocumentosPublicService } from './services/documentos-public.service';

import { DocumentosController } from './controllers/documentos.controller';
import { AssinaturasController } from './controllers/assinaturas.controller';
import { ContratosController } from './controllers/contratos.controller';
import { DossieController } from './controllers/dossie.controller';
import { PortalDocumentosController } from './controllers/portal-documentos.controller';

@Module({
  imports: [PrismaModule, OutboxModule],
  controllers: [
    DocumentosController,
    AssinaturasController,
    ContratosController,
    DossieController,
    PortalDocumentosController,
  ],
  providers: [
    {
      provide: DOCUMENT_SIGNATURE_PROVIDER,
      useClass: EddieInternalSignatureProvider,
    },
    DocumentosService,
    AssinaturasService,
    ContratosService,
    ModelosService,
    DossieService,
    ChecklistService,
    DocumentosPublicService,
  ],
  exports: [
    DocumentosPublicService,
    DocumentosService,
    AssinaturasService,
    ContratosService,
    ModelosService,
    DossieService,
    ChecklistService,
  ],
})
export class DocumentosModule {}
