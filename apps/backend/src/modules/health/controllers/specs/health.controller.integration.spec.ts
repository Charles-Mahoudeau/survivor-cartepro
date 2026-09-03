import packageJson from '../../../../../package.json';
import {
  closeTestApp,
  createTestApp,
  type TestApp,
} from '../../../../../test/app';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import { DependencyStatus } from '../../enums/dependency-status.enum';
import { HealthStatus } from '../../enums/health-status.enum';
import type { HealthResponseDto } from '../../models/health-response.dto';

let context: TestApp;

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

const probe = () => api(context.app).get('/health');

describe('the health probe', () => {
  it('answers 200 while the database is up', async () => {
    const body = bodyOf<HealthResponseDto>(await probe().expect(200));

    expect(body.status).toBe(HealthStatus.OK);
    expect(body.dependencies.database).toBe(DependencyStatus.UP);
  });

  it('answers the version of the build, not a literal somebody has to remember', async () => {
    const body = bodyOf<HealthResponseDto>(await probe().expect(200));

    expect(body.version).toBe(packageJson.version);
  });

  it('reports an uptime in whole seconds and a timestamp that parses', async () => {
    const body = bodyOf<HealthResponseDto>(await probe().expect(200));

    expect(Number.isInteger(body.uptimeSeconds)).toBe(true);
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('exposes those fields and nothing else, the probe being publicly routed', async () => {
    const body = bodyOf<Record<string, unknown>>(await probe().expect(200));

    expect(Object.keys(body).sort()).toEqual([
      'dependencies',
      'status',
      'timestamp',
      'uptimeSeconds',
      'version',
    ]);
    expect(Object.keys(body.dependencies as object)).toEqual(['database']);
  });

  it('stays outside the version prefix', async () => {
    await api(context.app).get(apiPath('/health')).expect(404);
  });
});
