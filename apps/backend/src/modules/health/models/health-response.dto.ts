import { ApiProperty } from '@nestjs/swagger';
import { DependencyStatus } from '../enums/dependency-status.enum';
import { HealthStatus } from '../enums/health-status.enum';

/**
 * Reachability of what the API cannot answer without.
 *
 * A name and a state, nothing else: the probe is reachable from the public
 * internet in the delivered artifact, so it says whether a dependency answers
 * and never where it lives or who it authenticates as.
 */
export class HealthDependenciesDto {
  @ApiProperty({
    enum: DependencyStatus,
    description: 'Whether the database returned a row.',
  })
  database: DependencyStatus;
}

export class HealthResponseDto {
  @ApiProperty({
    enum: HealthStatus,
    description: 'Degraded as soon as one dependency is down.',
  })
  status: HealthStatus;

  @ApiProperty({
    example: '0.0.1',
    description: 'Version of the build answering, read from its manifest.',
  })
  version: string;

  @ApiProperty({
    example: 3600,
    description:
      'Whole seconds since this process started, so a silent restart is visible.',
  })
  uptimeSeconds: number;

  @ApiProperty({
    example: '2026-09-03T12:00:00.000Z',
    description: 'When the snapshot was taken, ISO 8601 in UTC.',
  })
  timestamp: string;

  @ApiProperty({ type: HealthDependenciesDto })
  dependencies: HealthDependenciesDto;
}
