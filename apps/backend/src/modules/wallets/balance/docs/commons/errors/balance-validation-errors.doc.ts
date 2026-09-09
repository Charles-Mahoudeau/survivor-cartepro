import { ApiResponse } from '@nestjs/swagger';

export const BalanceValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'The identifier is not a UUID version 7.',
  });
};
