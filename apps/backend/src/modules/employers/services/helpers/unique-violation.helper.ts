import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';

/** Whether Postgres refused a write because it collided with a unique index. */
export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as { code?: string } | undefined;

  return driverError?.code === UNIQUE_VIOLATION;
}
