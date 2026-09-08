import { ApiResponse } from '@nestjs/swagger';

export const ApplicationValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'Invalid status, cursor, limit, or request body',
  });
};
