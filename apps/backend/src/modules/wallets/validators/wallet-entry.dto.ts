import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { WalletEntryDirection } from '../enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '../enums/wallet-entry-kind.enum';

@ApiSchema({ name: 'WalletEntry' })
export class WalletEntryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ enum: WalletEntryDirection }) direction: WalletEntryDirection;
  @ApiProperty() amount: string;
  @ApiProperty({ enum: WalletEntryKind }) kind: WalletEntryKind;

  @ApiProperty({
    nullable: true,
    description:
      'The partner name for a payment, the allocation label for a credit.',
  })
  label: string | null;
}

@ApiSchema({ name: 'WalletEntryPage' })
export class WalletEntryPageResponseDto {
  @ApiProperty({ type: () => [WalletEntryResponseDto] })
  items: WalletEntryResponseDto[];

  @ApiProperty({ nullable: true }) nextCursor: string | null;
  @ApiProperty() hasMore: boolean;
}
