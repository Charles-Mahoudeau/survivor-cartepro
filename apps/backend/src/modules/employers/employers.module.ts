import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsModule } from '@/modules/wallets';
import { EmployerController } from '@/modules/employers/controllers/employer.controller';
import { Employer } from '@/modules/employers/entities/employer.entity';
import { EmployerRepo } from '@/modules/employers/repos/employer.repo';
import { EmployerService } from '@/modules/employers/services/employer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employer]), WalletsModule],
  controllers: [EmployerController],
  providers: [EmployerRepo, EmployerService],
  exports: [EmployerService],
})
export class EmployersModule {}
