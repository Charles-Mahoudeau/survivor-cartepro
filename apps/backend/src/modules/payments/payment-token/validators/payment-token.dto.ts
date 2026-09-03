import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaymentTokenResponseDto {
  @ApiProperty()
  @Expose()
  token: string;

  @ApiProperty()
  @Expose()
  qrPayload: string;

  @ApiProperty({ minLength: 8, maxLength: 8 })
  @Expose()
  shortCode: string;

  @ApiProperty({ format: 'date-time' })
  @Expose()
  expiresAt: string;
}
