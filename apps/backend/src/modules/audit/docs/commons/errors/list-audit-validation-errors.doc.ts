import { ApiResponse } from '@nestjs/swagger';

export const ListAuditValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'Invalid cursor, limit, actor id, action or date.',
  });
};
