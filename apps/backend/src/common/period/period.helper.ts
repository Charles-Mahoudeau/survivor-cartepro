import { DEFAULT_PERIOD_DAYS } from './period.constants';
import type { PeriodQueryDto } from './period-query.dto';
import type { Period } from './period.types';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export class InvalidPeriodError extends Error {
  constructor() {
    super('Invalid period bounds');
    this.name = InvalidPeriodError.name;
  }
}

/** Turns the optional bounds of a query into the window a repo filters on. */
export function resolvePeriod(query: PeriodQueryDto): Period {
  const to = query.to ? new Date(query.to) : null;
  const from = query.from
    ? new Date(query.from)
    : new Date(
        (to ?? new Date()).getTime() -
          DEFAULT_PERIOD_DAYS * MILLISECONDS_PER_DAY,
      );

  if (to && from > to) {
    throw new InvalidPeriodError();
  }

  return { from, to };
}
