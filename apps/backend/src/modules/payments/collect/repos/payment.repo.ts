import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import { CaptureMode } from '@/modules/payments/core/enums';
import { Payment } from '@/modules/payments/core/entities/payment.entity';

export interface NewPayment {
  walletId: string;
  partnerId: string;
  paymentTokenId: string;
  amount: number;
  captureMode: CaptureMode;
  partnerReference: string | null;
}

@Injectable()
export class PaymentRepo {
  constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
  ) {}

  create(data: NewPayment, manager?: EntityManager): Promise<Payment> {
    const repo = manager ? manager.getRepository(Payment) : this.repo;
    return repo.save({
      wallet: { id: data.walletId },
      partner: { id: data.partnerId },
      paymentToken: { id: data.paymentTokenId },
      amount: data.amount,
      captureMode: data.captureMode,
      partnerReference: data.partnerReference,
    });
  }

  /** The payment a consumed token already produced — the source of a replay's response. */
  findByTokenId(
    paymentTokenId: string,
    manager?: EntityManager,
  ): Promise<Payment | null> {
    const repo = manager ? manager.getRepository(Payment) : this.repo;
    return repo.findOne({ where: { paymentToken: { id: paymentTokenId } } });
  }
}
