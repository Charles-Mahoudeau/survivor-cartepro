import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  AllocationBeneficiaryDto,
  AllocationDetailResponseDto,
  AllocationExcludedDto,
} from '../../../validators/allocation.dto';

export const AllocationDetailResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(
      AllocationDetailResponseDto,
      AllocationBeneficiaryDto,
      AllocationExcludedDto,
    ),
    ApiResponse({
      status: 200,
      description:
        'The allocation and who it credits. A draft answers with the wallets ' +
        'an apply would credit today; an applied one answers with the wallets ' +
        'it actually credited.',
      schema: { $ref: getSchemaPath(AllocationDetailResponseDto) },
    }),
  );
};
