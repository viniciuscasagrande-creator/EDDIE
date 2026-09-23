import { Module } from '@nestjs/common';
import { EstornoService } from './estorno.service';
import { EstornoPolicy } from './estorno.policy';
import { EstornoConsumer } from './estorno.consumer';

import { EstornoController } from './estorno.controller';
import { ChargebackController } from './chargeback.controller';
import { EstornoPublicService } from './estorno.public-service';

@Module({
  controllers: [EstornoController, ChargebackController],
  providers: [EstornoService, EstornoPolicy, EstornoConsumer, EstornoPublicService],
  exports: [EstornoPublicService],
})
export class EstornoModule {}
