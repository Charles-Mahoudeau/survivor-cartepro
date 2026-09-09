import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';

interface DriverError extends Error {
  code?: string;
  constraint?: string;
}

/** Whether Postgres refused a write because it collided with a unique index. */
export function isUniqueViolation(error: unknown): boolean {
  return driverErrorOf(error)?.code === UNIQUE_VIOLATION;
}

/** The unique index a write collided with, or null when it failed otherwise. */
export function uniqueViolationConstraint(error: unknown): string | null {
  const driverError = driverErrorOf(error);

  if (driverError?.code !== UNIQUE_VIOLATION) {
    return null;
  }

  return driverError.constraint ?? null;
}

function driverErrorOf(error: unknown): DriverError | undefined {
  if (!(error instanceof QueryFailedError)) {
    return undefined;
  }

  return (error as QueryFailedError<DriverError>).driverError;
}
