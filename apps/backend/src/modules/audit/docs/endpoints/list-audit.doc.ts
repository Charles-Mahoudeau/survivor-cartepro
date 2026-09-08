import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ForbiddenRoleDoc,
  InvalidPeriodDoc,
  UnauthenticatedDoc,
} from '@/common/docs';
import { AuditPageResponseDoc, ListAuditValidationErrorsDoc } from '../commons';

export const ListAuditDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'List the audit chain',
      description:
        'Paginated, most recent first. Filterable by date window, actor and ' +
        'action. Reserved to administrators.',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Opaque cursor returned by a previous page',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      minimum: 1,
      maximum: 100,
      description: 'Number of entries to return',
    }),
    ApiQuery({
      name: 'from',
      required: false,
      type: String,
      description:
        'Start of the window, ISO 8601. Defaults to 30 days before the end.',
    }),
    ApiQuery({
      name: 'to',
      required: false,
      type: String,
      description: 'End of the window, ISO 8601. Open when absent.',
    }),
    ApiQuery({
      name: 'actorId',
      required: false,
      type: String,
      description: 'Filter by the account that performed the operation',
    }),
    ApiQuery({
      name: 'action',
      required: false,
      type: String,
      description: 'Filter by the recorded action',
    }),
    AuditPageResponseDoc(),
    ListAuditValidationErrorsDoc(),
    InvalidPeriodDoc(),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
  );
};
