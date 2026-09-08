import type { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';

/** One wallet of an employer, as the modules that credit them read it. */
export interface EmployerWallet {
  id: string;
  employeeRef: string | null;
  holderName: string;
  status: WalletStatus;
}

/** What an allocation asks the wallets to do to every wallet of an employer. */
export interface AllocationCredit {
  allocationId: string;
  employerId: string;
  amount: number;
}

/** Who the credit reached, and who it left alone. */
export interface AllocationCreditOutcome {
  credited: EmployerWallet[];
  excluded: EmployerWallet[];
}
