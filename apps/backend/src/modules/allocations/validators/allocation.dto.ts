import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_ALLOCATION_AMOUNT,
  MAX_ALLOCATION_LABEL_LENGTH,
} from '../constants';
import { AllocationExclusionReason } from '../enums/allocation-exclusion-reason.enum';
import { AllocationStatus } from '../enums/allocation-status.enum';

export class CreateAllocationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('7')
  employerId: string;

  @ApiProperty({ maxLength: MAX_ALLOCATION_LABEL_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_ALLOCATION_LABEL_LENGTH)
  label: string;

  @ApiProperty({
    description: 'Euros credited to each active wallet of the employer.',
    maximum: MAX_ALLOCATION_AMOUNT,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(MAX_ALLOCATION_AMOUNT)
  amount: number;
}

export class UpdateAllocationDto {
  @ApiPropertyOptional({ maxLength: MAX_ALLOCATION_LABEL_LENGTH })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_ALLOCATION_LABEL_LENGTH)
  label?: string;

  @ApiPropertyOptional({ maximum: MAX_ALLOCATION_AMOUNT })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(MAX_ALLOCATION_AMOUNT)
  amount?: number;
}

@ApiSchema({ name: 'Allocation' })
export class AllocationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() employerId: string;
  @ApiProperty() employerName: string;
  @ApiProperty() label: string;
  @ApiProperty() amount: string;
  @ApiProperty({ enum: AllocationStatus }) status: AllocationStatus;
  @ApiProperty({ nullable: true }) appliedAt: Date | null;
  @ApiProperty() createdAt: Date;
}

@ApiSchema({ name: 'AllocationBeneficiary' })
export class AllocationBeneficiaryDto {
  @ApiProperty() walletId: string;
  @ApiProperty({ nullable: true }) employeeRef: string | null;
  @ApiProperty() holderName: string;
}

@ApiSchema({ name: 'AllocationExcluded' })
export class AllocationExcludedDto extends AllocationBeneficiaryDto {
  @ApiProperty({ enum: AllocationExclusionReason })
  reason: AllocationExclusionReason;
}

@ApiSchema({ name: 'AllocationDetail' })
export class AllocationDetailResponseDto extends AllocationResponseDto {
  @ApiProperty({
    type: () => [AllocationBeneficiaryDto],
    description: 'Active wallets of the employer, which the apply will credit.',
  })
  beneficiaries: AllocationBeneficiaryDto[];

  @ApiProperty({
    type: () => [AllocationExcludedDto],
    description: 'Wallets of the employer the apply will skip, and why.',
  })
  excluded: AllocationExcludedDto[];

  @ApiProperty({ description: 'Amount multiplied by the beneficiary count.' })
  total: string;
}

@ApiSchema({ name: 'AllocationApplied' })
export class AllocationAppliedResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: AllocationStatus }) status: AllocationStatus;
  @ApiProperty() appliedAt: Date;

  @ApiProperty({
    description: 'How many wallets the allocation just credited.',
  })
  creditedCount: number;

  @ApiProperty({ description: 'Amount multiplied by the credited count.' })
  total: string;

  @ApiProperty({
    type: () => [AllocationExcludedDto],
    description: 'Wallets of the employer the apply skipped, and why.',
  })
  excluded: AllocationExcludedDto[];
}

@ApiSchema({ name: 'AllocationPage' })
export class AllocationPageResponseDto {
  @ApiProperty({ type: () => [AllocationResponseDto] })
  items: AllocationResponseDto[];

  @ApiProperty({ nullable: true }) nextCursor: string | null;
  @ApiProperty() hasMore: boolean;
}
