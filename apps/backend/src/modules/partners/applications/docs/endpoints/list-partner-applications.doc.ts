import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import { PartnerStatus } from '@/modules/partners/core';
import {
  PartnerApplicationListResponseDoc,
  PartnerApplicationValidationErrorsDoc,
} from '../commons';

export const ListPartnerApplicationsDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'List partner applications awaiting review (admin only)',
      description:
        'Defaults to the pending queue; pass status to inspect any other stage.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: PartnerStatus,
      description: 'Filter by application status, defaults to pending',
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
      description: 'Number of applications to return',
    }),
    PartnerApplicationListResponseDoc(),
    PartnerApplicationValidationErrorsDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
