import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const EmployerNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description: 'No employer carries this identifier.',
    examples: {
      [ERROR_CODES.EMPLOYER_NOT_FOUND]: {
        summary: ERROR_CODES.EMPLOYER_NOT_FOUND,
        value: { statusCode: 404, message: ERROR_CODES.EMPLOYER_NOT_FOUND },
      },
    },
  });
};
