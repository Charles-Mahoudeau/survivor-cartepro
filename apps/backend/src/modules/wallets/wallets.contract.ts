import type { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';

/** One wallet of an employer, as the modules that credit them read it. */
export interface EmployerWallet {
  id: string;
  employeeRef: string | null;
  holderName: string;
  status: WalletStatus;
}
