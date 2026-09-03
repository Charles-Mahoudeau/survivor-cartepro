import { Injectable } from '@nestjs/common';
import { APP_VERSION } from '../constants/health.constants';
import { HealthRepo } from '../repos/health.repo';
import type { HealthResponseDto } from '../models/health-response.dto';
import { buildHealthSnapshot } from './helpers/health-snapshot.helper';

@Injectable()
export class HealthService {
  constructor(private readonly healthRepo: HealthRepo) {}

  /** Reads every dependency, then hands the observation to the pure builder. */
  async snapshot(): Promise<HealthResponseDto> {
    return buildHealthSnapshot({
      databaseReachable: await this.healthRepo.isDatabaseReachable(),
      version: APP_VERSION,
      uptimeSeconds: process.uptime(),
      at: new Date(),
    });
  }
}
