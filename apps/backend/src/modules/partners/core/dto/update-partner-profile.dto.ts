import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

@ApiSchema({ name: 'UpdatePartnerProfile' })
export class UpdatePartnerProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @Length(9, 9)
  @Matches(/^[0-9]{9}$/, { message: 'siren must be a 9-digit string' })
  siren?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessPurpose?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ type: [String], example: ['restaurant', 'bakery'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  categories?: string[];
}
