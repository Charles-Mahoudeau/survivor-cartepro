import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  SHORT_CODE_LENGTH,
  SHORT_CODE_PATTERN,
} from '@/modules/payments/payment-token/constants';
import {
  MAX_PARTNER_REFERENCE_LENGTH,
  MAX_PAYMENT_AMOUNT,
  MAX_QR_PAYLOAD_LENGTH,
} from '../constants';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimUpperCase = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

/** Whichever of the two the employee's screen gave the partner — exactly one. */
export class CollectPaymentDto {
  @ApiPropertyOptional({
    maxLength: MAX_QR_PAYLOAD_LENGTH,
    description:
      'The scanned QR payload. Mutually exclusive with shortCode: send one, ' +
      'never both.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_QR_PAYLOAD_LENGTH)
  qrPayload?: string;

  @ApiPropertyOptional({
    minLength: SHORT_CODE_LENGTH,
    maxLength: SHORT_CODE_LENGTH,
    description:
      'The code the partner typed, uppercased on the way in. Mutually ' +
      'exclusive with qrPayload.',
  })
  @IsOptional()
  @Transform(trimUpperCase)
  @Matches(SHORT_CODE_PATTERN)
  shortCode?: string;

  @ApiProperty({
    description: 'Euros debited from the employee wallet.',
    maximum: MAX_PAYMENT_AMOUNT,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(MAX_PAYMENT_AMOUNT)
  amount: number;

  @ApiPropertyOptional({
    maxLength: MAX_PARTNER_REFERENCE_LENGTH,
    description: "The partner's own till or receipt reference.",
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_PARTNER_REFERENCE_LENGTH)
  partnerReference?: string;
}

/** What the till gets back: the partner's side of a settled payment, never the wallet balance. */
@ApiSchema({ name: 'PaymentReceipt' })
export class PaymentReceiptResponseDto {
  @ApiProperty() paymentId: string;
  @ApiProperty() amount: string;
  @ApiProperty({ nullable: true }) partnerReference: string | null;
  @ApiProperty() createdAt: Date;
}
