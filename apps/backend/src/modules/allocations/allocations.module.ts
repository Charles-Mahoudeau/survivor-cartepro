import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Allocation])],
})
export class AllocationsModule {}
