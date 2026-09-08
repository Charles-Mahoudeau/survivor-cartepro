import { ApiResponse } from '@nestjs/swagger';

export const CreateEmployerValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'Invalid name or SIREN. A SIREN is nine digits.',
  });
};

export const ListEmployersValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'Invalid cursor or limit.',
  });
};
