import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SessionUserDto } from '../../../validators/auth.dto';

export const SessionUserResponseDoc = () =>
  applyDecorators(
    ApiExtraModels(SessionUserDto),
    ApiResponse({
      status: 200,
      description: 'The authenticated account.',
      schema: { $ref: getSchemaPath(SessionUserDto) },
    }),
  );
