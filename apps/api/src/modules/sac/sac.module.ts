import { Module } from '@nestjs/common'; import { SacController } from './sac.controller'; import { SacService } from './sac.service';
@Module({controllers:[SacController],providers:[SacService]}) export class SacModule {}
