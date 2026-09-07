import { ApiResponse } from '@nestjs/swagger';

export const EmployerValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description:
      'Invalid owner identifier, name, SIREN, cursor or limit. A SIREN is ' +
      'nine digits.',
  });
};
