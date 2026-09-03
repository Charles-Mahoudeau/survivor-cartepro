import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletEntry])],
})
export class WalletsModule {}
