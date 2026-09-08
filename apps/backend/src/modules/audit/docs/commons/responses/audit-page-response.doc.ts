import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { AuditPageResponseDto, AuditResponseDto } from '../../../validators';

export const AuditPageResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(AuditPageResponseDto, AuditResponseDto),
    ApiResponse({
      status: 200,
      description: 'A page of the audit chain, most recent entry first.',
      schema: { $ref: getSchemaPath(AuditPageResponseDto) },
    }),
  );
};
