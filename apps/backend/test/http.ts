import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import type { Response } from 'supertest';

/**
 * Opens a request against the application.
 *
 * `getHttpServer()` is typed `any` by Nest, so the assertion happens here once
 * rather than in every spec — where the linter would be right to complain, and
 * where a reader would have to decide each time whether the cast is safe.
 */
export function api(app: INestApplication) {
  return request(app.getHttpServer() as Server);
}

/**
 * Reads a response body at a declared shape.
 *
 * Supertest types `body` as `any`, which makes every assertion on it an
 * unchecked member access. Naming the shape at the call site restores the
 * check: a spec that expects `{ user: { role } }` and receives something else
 * fails at compile time rather than on a comparison against `undefined`.
 */
export function bodyOf<T>(response: Response): T {
  return response.body as T;
}
