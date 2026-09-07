import { ApiResponse } from '@nestjs/swagger';

export const PartnerApplicationValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'Invalid status, cursor, limit, or request body',
  });
};
