import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { HealthRepo } from './repos/health.repo';
import { HealthService } from './services/health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthRepo],
})
export class HealthModule {}
