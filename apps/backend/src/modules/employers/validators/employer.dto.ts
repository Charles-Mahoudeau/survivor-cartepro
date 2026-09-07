import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MAX_EMPLOYER_NAME_LENGTH, SIREN_PATTERN } from '../constants';

export class CreateEmployerDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The account that will administer this employer.',
  })
  @IsUUID('7')
  ownerId: string;

  @ApiProperty({ maxLength: MAX_EMPLOYER_NAME_LENGTH })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_EMPLOYER_NAME_LENGTH)
  name: string;

  @ApiProperty({ pattern: '^\\d{9}$', example: '552100554' })
  @IsString()
  @Matches(SIREN_PATTERN)
  siren: string;
}

@ApiSchema({ name: 'Employer' })
export class EmployerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() siren: string;
  @ApiProperty() ownerId: string;

  @ApiProperty({
    description: 'Wallets an allocation targeting this employer would credit.',
  })
  activeWalletCount: number;

  @ApiProperty() createdAt: Date;
}

@ApiSchema({ name: 'EmployerPage' })
export class EmployerPageResponseDto {
  @ApiProperty({ type: () => [EmployerResponseDto] })
  items: EmployerResponseDto[];

  @ApiProperty({ nullable: true }) nextCursor: string | null;
  @ApiProperty() hasMore: boolean;
}
