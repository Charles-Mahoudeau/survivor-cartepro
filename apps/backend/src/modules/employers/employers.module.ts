import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employer } from '@/modules/employers/entities/employer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employer])],
})
export class EmployersModule {}
