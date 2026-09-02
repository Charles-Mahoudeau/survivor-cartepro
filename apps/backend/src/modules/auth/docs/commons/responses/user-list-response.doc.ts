import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SessionUserDto, UserListDto } from '../../../validators/auth.dto';

export const UserListResponseDoc = () =>
  applyDecorators(
    ApiExtraModels(UserListDto, SessionUserDto),
    ApiResponse({
      status: 200,
      description: 'One page of accounts, newest first.',
      schema: { $ref: getSchemaPath(UserListDto) },
    }),
  );
