import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { MAX_LOGGED_PAYLOAD_LENGTH } from '../constants/logging.constants';
import { redact } from '../utils/redact.util';

/**
 * Request logger. Writes one line in and one line out, and nothing that would
 * be a leak if the logs were read: query and body go through the denylist
 * redaction, and the response body is not logged at all — a payment QR or an
 * employee balance returned by a handler never reaches a log line.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startedAt = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method } = request;
    // The PATH only, never `originalUrl`. `originalUrl` carries the raw query
    // string, which would reprint every parameter unredacted on the same line
    // that redacts them — a payment QR passed as `?qrPayload=…` would land in
    // the logs in clear right next to its own `[redacted]`. Parameters reach
    // the log through the redacted `query=` payload below, and nowhere else.
    const path = request.originalUrl.split('?')[0];
    const requestPayload = this.buildPayloadLog(redact(request.body));
    const queryPayload = this.buildPayloadLog(redact(request.query));
    const requestDetails: string[] = [];

    if (queryPayload) {
      requestDetails.push(`query=${queryPayload}`);
    }
    if (requestPayload) {
      requestDetails.push(`body=${requestPayload}`);
    }

    const requestLogSuffix = requestDetails.length
      ? ` ${requestDetails.join(' ')}`
      : '';

    this.logger.log(`→ ${method} ${path}${requestLogSuffix}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        const statusCode = response.statusCode;

        this.logger.log(`← ${statusCode} ${method} ${path} (${duration}ms)`);
      }),
    );
  }

  private buildPayloadLog(payload: unknown): string {
    if (payload === undefined || payload === null) {
      return '';
    }

    try {
      const serialized = JSON.stringify(payload);
      if (serialized === '{}' || serialized === '[]') {
        return '';
      }

      return serialized.length > MAX_LOGGED_PAYLOAD_LENGTH
        ? `${serialized.slice(0, MAX_LOGGED_PAYLOAD_LENGTH - 3)}...`
        : serialized;
    } catch {
      return '[unserializable]';
    }
  }
}
