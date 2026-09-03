import { DependencyStatus } from '../../../enums/dependency-status.enum';
import { HealthStatus } from '../../../enums/health-status.enum';
import { buildHealthSnapshot } from '../health-snapshot.helper';

const AT = new Date('2026-09-03T12:00:00.000Z');

const snapshot = (databaseReachable: boolean) =>
  buildHealthSnapshot({
    databaseReachable,
    version: '1.2.3',
    uptimeSeconds: 3600.987,
    at: AT,
  });

describe('buildHealthSnapshot', () => {
  it('reports ok while every dependency answers', () => {
    const result = snapshot(true);

    expect(result.status).toBe(HealthStatus.OK);
    expect(result.dependencies.database).toBe(DependencyStatus.UP);
  });

  it('reports degraded as soon as the database stops answering', () => {
    const result = snapshot(false);

    expect(result.status).toBe(HealthStatus.DEGRADED);
    expect(result.dependencies.database).toBe(DependencyStatus.DOWN);
  });

  it('answers the version it was handed, so a bump cannot be forgotten here', () => {
    expect(snapshot(true).version).toBe('1.2.3');
  });

  it('reports uptime in whole seconds', () => {
    expect(snapshot(true).uptimeSeconds).toBe(3600);
  });

  it('stamps the instant it was given, in UTC', () => {
    expect(snapshot(true).timestamp).toBe('2026-09-03T12:00:00.000Z');
  });

  it('builds class instances, which is what the global serializer filters', () => {
    const result = snapshot(true);

    expect(result.constructor.name).toBe('HealthResponseDto');
    expect(result.dependencies.constructor.name).toBe('HealthDependenciesDto');
  });
});
