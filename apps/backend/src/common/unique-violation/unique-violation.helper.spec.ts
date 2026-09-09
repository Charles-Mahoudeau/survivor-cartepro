import { describe, expect, it } from '@jest/globals';
import { QueryFailedError } from 'typeorm';
import {
  isUniqueViolation,
  uniqueViolationConstraint,
} from './unique-violation.helper';

function queryFailure(driverError: Partial<Error & Record<string, string>>) {
  return new QueryFailedError(
    'INSERT INTO "employer" ...',
    [],
    Object.assign(new Error('duplicate key value'), driverError),
  );
}

describe('unique violation helper', () => {
  it('recognises the failure Postgres raises on a duplicate', () => {
    expect(
      isUniqueViolation(
        queryFailure({ code: '23505', constraint: 'UQ_employer_siren' }),
      ),
    ).toBe(true);
  });

  it('leaves any other database failure alone', () => {
    expect(isUniqueViolation(queryFailure({ code: '23503' }))).toBe(false);
  });

  it('leaves an error that never reached the database alone', () => {
    expect(isUniqueViolation(new Error('offline'))).toBe(false);
  });

  it('names the index the write collided with', () => {
    expect(
      uniqueViolationConstraint(
        queryFailure({ code: '23505', constraint: 'UQ_employer_siren' }),
      ),
    ).toBe('UQ_employer_siren');
  });

  it('names no index when the failure is not a duplicate', () => {
    expect(
      uniqueViolationConstraint(
        queryFailure({ code: '23503', constraint: 'FK_wallet_employer' }),
      ),
    ).toBeNull();
  });

  it('names no index when a duplicate carries none', () => {
    expect(
      uniqueViolationConstraint(queryFailure({ code: '23505' })),
    ).toBeNull();
  });
});
