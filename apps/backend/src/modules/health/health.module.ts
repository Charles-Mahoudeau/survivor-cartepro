import { Module } from '@nestjs/common';
import { HealthController } from '@/modules/health/controllers';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
