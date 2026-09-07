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

  findIdByUserId(userId: string): Promise<Pick<Wallet, 'id'> | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      select: { id: true },
    });
  }

  findByEmployerId(employerId: string): Promise<Wallet[]> {
    return this.repo.find({
      where: { employer: { id: employerId } },
      select: {
        id: true,
        employeeRef: true,
        status: true,
        user: { id: true, name: true },
      },
      relations: { user: true },
      order: { id: 'ASC' },
    });
  }
}
