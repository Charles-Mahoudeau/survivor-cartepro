import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const EmployerOwnerNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description: 'No account carries the identifier given as the owner.',
    examples: {
      [ERROR_CODES.EMPLOYER_OWNER_NOT_FOUND]: {
        summary: ERROR_CODES.EMPLOYER_OWNER_NOT_FOUND,
        value: {
          statusCode: 404,
          message: ERROR_CODES.EMPLOYER_OWNER_NOT_FOUND,
        },
      },
    },
  });
};
