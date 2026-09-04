import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './controllers/wallet.controller';
import { WalletEntry } from './entities/wallet-entry.entity';
import { Wallet } from './entities/wallet.entity';
import { WalletRepo } from './repos/wallet.repo';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletEntry])],
  controllers: [WalletController],
  providers: [WalletRepo, WalletService],
  exports: [WalletService],
})
export class WalletsModule {}
