import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import {
  ForbiddenDoc,
  UnauthenticatedDoc,
  UserListResponseDoc,
} from '../commons';

export const ListUsersDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'List accounts',
      description:
        'Reserved to the administration. Paged; `search` matches a substring ' +
        'of the email. The role is read from the database on each request, so ' +
        'a revoked administrator is refused on the request that follows.',
    }),
    UserListResponseDoc(),
    UnauthenticatedDoc(),
    ForbiddenDoc(ERROR_CODES.ACCOUNT_BANNED, ERROR_CODES.FORBIDDEN_ROLE),
  );
