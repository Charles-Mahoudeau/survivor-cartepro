import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import {
  ForbiddenDoc,
  SessionUserResponseDoc,
  UnauthenticatedDoc,
} from '../commons';

export const GetMeDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Read the authenticated account',
      description:
        'Returns the account behind the session cookie, in this API shape ' +
        'rather than the raw Better Auth payload. Any role is accepted. ' +
        'A banned account is refused even if its session predates the ban.',
    }),
    SessionUserResponseDoc(),
    UnauthenticatedDoc(),
    ForbiddenDoc(ERROR_CODES.ACCOUNT_BANNED),
  );
