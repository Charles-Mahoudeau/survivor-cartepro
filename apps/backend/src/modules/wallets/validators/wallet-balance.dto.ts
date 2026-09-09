import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'WalletBalance' })
export class WalletBalanceResponseDto {
  @ApiProperty() balance: string;
}
