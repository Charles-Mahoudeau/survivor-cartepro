import { ApiResponse } from '@nestjs/swagger';

export const AllocationValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description:
      'Invalid employer identifier, label, amount, cursor or limit. An ' +
      'amount is a positive number of euros with at most two decimals.',
  });
};
