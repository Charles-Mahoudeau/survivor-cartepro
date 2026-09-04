import { ApiResponse } from '@nestjs/swagger';

export const PartnerValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'Invalid search, category, cursor, or limit parameter',
  });
};
