import {
  Controller,
  Get,
  HttpStatus,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { HealthStatus } from '../enums/health-status.enum';
import { HealthResponseDto } from '../models/health-response.dto';
import { HealthService } from '../services/health.service';

/**
 * The probe, deliberately outside the version prefix: a monitor pinning
 * `/api/v1` would stop reporting the day the API moves to v2, which is exactly
 * the day it is most worth watching.
 */
@ApiTags('Health')
@Public()
@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Application state and deployed version' })
  @ApiOkResponse({
    type: HealthResponseDto,
    description: 'Every dependency answered.',
  })
  @ApiServiceUnavailableResponse({
    type: HealthResponseDto,
    description:
      'The process is up but a dependency is not. The body has the same shape, so a monitor reads which one from the same field either way.',
  })
  async check(
    @Res({ passthrough: true }) response: Response,
  ): Promise<HealthResponseDto> {
    const snapshot = await this.healthService.snapshot();

    // The status code is what a probe keys on; a degraded body behind a 200
    // reads as healthy to every monitor that only looks at the code.
    response.status(
      snapshot.status === HealthStatus.OK
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE,
    );

    return snapshot;
  }
}
