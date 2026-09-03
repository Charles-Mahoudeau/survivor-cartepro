import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import type { Response } from 'supertest';
import { API_DEFAULT_VERSION, API_PREFIX } from '@/bootstrap';

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

/**
 * Prefixes a Nest route with the global prefix and URI version `configureApp`
 * sets, so a spec calls the path a client calls. `/auth` and `/health` sit
 * outside both and are written as-is.
 */
export function apiPath(path: string): string {
  return `/${API_PREFIX}/v${API_DEFAULT_VERSION}${path}`;
}
