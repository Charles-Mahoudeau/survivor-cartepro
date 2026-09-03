import { DependencyStatus } from '../../enums/dependency-status.enum';
import { HealthStatus } from '../../enums/health-status.enum';
import {
  HealthDependenciesDto,
  HealthResponseDto,
} from '../../models/health-response.dto';

export interface HealthSnapshotInput {
  databaseReachable: boolean;
  version: string;
  uptimeSeconds: number;
  at: Date;
}

/**
 * Turns what was observed into the body the probe answers.
 *
 * The clock and the process are read by the caller and passed in, which is what
 * lets this be exercised for both outcomes without a running database.
 *
 * Real instances rather than literals: `ClassSerializerInterceptor` is global
 * and only filters class instances, so a field marked `@Exclude()` here later
 * would go out on the wire anyway if this returned a plain object.
 */
export function buildHealthSnapshot({
  databaseReachable,
  version,
  uptimeSeconds,
  at,
}: HealthSnapshotInput): HealthResponseDto {
  const dependencies = Object.assign(new HealthDependenciesDto(), {
    database: databaseReachable ? DependencyStatus.UP : DependencyStatus.DOWN,
  });

  return Object.assign(new HealthResponseDto(), {
    status: databaseReachable ? HealthStatus.OK : HealthStatus.DEGRADED,
    version,
    uptimeSeconds: Math.floor(uptimeSeconds),
    timestamp: at.toISOString(),
    dependencies,
  });
}
