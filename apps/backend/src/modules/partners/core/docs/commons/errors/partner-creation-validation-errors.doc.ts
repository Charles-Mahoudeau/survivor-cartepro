import { ApiResponse } from '@nestjs/swagger';

export const PartnerCreationValidationErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description:
      'A required field is missing, the SIREN is not 9 digits or fails its Luhn checksum, latitude/longitude are out of range, or categories is empty',
  });
};
