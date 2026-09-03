import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import type { Response } from 'supertest';

/** `getHttpServer()` is typed `any`, so the assertion happens here once. */
export function api(app: INestApplication) {
  return request(app.getHttpServer() as Server);
}

/**
 * Supertest types `body` as `any`. Naming the shape at the call site restores
 * the check: a spec that expects the wrong one fails at compile time.
 */
export function bodyOf<T>(response: Response): T {
  return response.body as T;
}
