import { ApiResponse } from '@nestjs/swagger';

export const WalletEntryValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'Invalid cursor, limit, or period bound',
  });
};
