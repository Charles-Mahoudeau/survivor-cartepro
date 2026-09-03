import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from './entities/allocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Allocation])],
})
export class AllocationsModule {}
