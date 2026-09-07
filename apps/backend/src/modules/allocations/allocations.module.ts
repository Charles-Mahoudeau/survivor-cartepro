import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployersModule } from '@/modules/employers';
import { WalletsModule } from '@/modules/wallets';
import { AllocationController } from '@/modules/allocations/controllers/allocation.controller';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { AllocationRepo } from '@/modules/allocations/repos/allocation.repo';
import { AllocationService } from '@/modules/allocations/services/allocation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Allocation]),
    EmployersModule,
    WalletsModule,
  ],
  controllers: [AllocationController],
  providers: [AllocationRepo, AllocationService],
})
export class AllocationsModule {}
