import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ForbiddenRoleDoc,
  InvalidPeriodDoc,
  UnauthenticatedDoc,
} from '@/common/docs';
import { AuditExportResponseDoc } from '../commons';

export const ExportAuditDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Export a signed period of the audit chain',
      description:
        'Everything the requested window holds, signed as one file so its ' +
        'integrity can be checked later without the database. Reserved to ' +
        'administrators.',
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
    AuditExportResponseDoc(),
    InvalidPeriodDoc(),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
  );
};
