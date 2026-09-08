import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';
import { isValidSirenChecksum } from '../services/helpers';

/**
 * Validates the Luhn checksum of a SIREN. Pair with `@Matches(/^\d{9}$/)` for
 * the format check — this only checks the digits that pass it.
 */
function IsValidSiren(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidSiren',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isValidSirenChecksum(value);
        },
        defaultMessage(): string {
          return 'siren must have a valid Luhn checksum';
        },
      },
    });
  };
}

@ApiSchema({ name: 'CreatePartner' })
export class CreatePartnerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tradeName: string;

  @ApiProperty({ example: '552100554' })
  @IsString()
  @Matches(/^\d{9}$/, { message: 'siren must be 9 digits' })
  @IsValidSiren()
  siren: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessPurpose: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 48.8566 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 2.3522 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ type: [String], example: ['restaurant', 'bakery'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ArrayUnique()
  categories: string[];
}
