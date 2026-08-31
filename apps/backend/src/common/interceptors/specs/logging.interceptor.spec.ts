import { jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { LoggingInterceptor } from '../logging.interceptor';

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({ statusCode: 200 }),
    }),
  } as unknown as ExecutionContext;
}

const nextHandler: CallHandler = { handle: () => of({ ok: true }) };

describe('LoggingInterceptor', () => {
  let lines: string[];

  beforeEach(() => {
    lines = [];
    jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation((message: unknown) => {
        lines.push(String(message));
      });
  });

  afterEach(() => jest.restoreAllMocks());

  async function run(request: Record<string, unknown>) {
    const interceptor = new LoggingInterceptor();
    await lastValueFrom(
      interceptor.intercept(contextFor(request), nextHandler),
    );
    return lines.join('\n');
  }

  it('never reprints the raw query string alongside the redacted payload', async () => {
    const output = await run({
      method: 'GET',
      originalUrl: '/payments?qrPayload=eyJhbGciOi&amount=1250',
      query: { qrPayload: 'eyJhbGciOi', amount: '1250' },
      body: {},
    });

    expect(output).not.toContain('eyJhbGciOi');
    expect(output).not.toContain('1250');
    expect(output).toContain('/payments');
    expect(output).toContain('[redacted]');
  });

  it('logs the path, the redacted query and the redacted body', async () => {
    const output = await run({
      method: 'POST',
      originalUrl: '/transactions?debug=true',
      query: { debug: 'true' },
      body: { partnerId: 'p_1', amount: 990 },
    });

    expect(output).toContain('→ POST /transactions');
    expect(output).toContain('query={"debug":"true"}');
    expect(output).toContain('"partnerId":"p_1"');
    expect(output).toContain('"amount":"[redacted]"');
  });

  it('never logs the response body', async () => {
    const interceptor = new LoggingInterceptor();
    const secretResponse = { qrPayload: 'eyJsZWFr' };
    await lastValueFrom(
      interceptor.intercept(
        contextFor({
          method: 'GET',
          originalUrl: '/qr',
          query: {},
          body: {},
        }),
        { handle: () => of(secretResponse) },
      ),
    );

    expect(lines.join('\n')).not.toContain('eyJsZWFr');
  });

  it('omits the payload markers when there is nothing to show', async () => {
    const output = await run({
      method: 'GET',
      originalUrl: '/health',
      query: {},
      body: {},
    });

    expect(output).toContain('→ GET /health');
    expect(output).not.toContain('query=');
    expect(output).not.toContain('body=');
  });
});
