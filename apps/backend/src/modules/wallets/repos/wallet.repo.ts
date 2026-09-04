import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class WalletRepo {
  constructor(
    @InjectRepository(Wallet) private readonly repo: Repository<Wallet>,
  ) {}

  findByUserId(userId: string): Promise<Wallet | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: { entries: true },
      order: { entries: { createdAt: 'DESC' } },
    });
  }
}
