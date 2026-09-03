import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { WalletStatus } from '../enums/wallet-status.enum';
import { WalletEntryDirection } from '../enums/wallet-entry-direction.enum';

@ApiSchema({ name: 'WalletLastMovement' })
class LastMovementDto {
  @ApiProperty() amount: string;
  @ApiProperty({ enum: WalletEntryDirection }) direction: WalletEntryDirection;
  @ApiProperty() createdAt: Date;
}

@ApiSchema({ name: 'Wallet' })
export class WalletResponseDto {
  @ApiProperty() balance: string;
  @ApiProperty() currency: string;
  @ApiProperty({ enum: WalletStatus }) status: WalletStatus;
  @ApiProperty({ type: LastMovementDto, nullable: true })
  lastMovement: LastMovementDto | null;
}
