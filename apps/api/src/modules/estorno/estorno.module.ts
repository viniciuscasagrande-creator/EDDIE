import { Module } from '@nestjs/common';
import { EstornoService } from './estorno.service';
import { EstornoPolicy } from './estorno.policy';
import { EstornoConsumer } from './estorno.consumer';

@Module({
  providers: [EstornoService, EstornoPolicy, EstornoConsumer],
  exports: [],
})
export class EstornoModule {}
