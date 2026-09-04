/**
 * How far below zero a wallet may go, in euros. A debit that would leave the
 * balance under `-WALLET_OVERDRAFT_LIMIT` is refused, and the check constraint
 * on `wallet.balance` is derived from this same value so the two cannot drift.
 */
export const WALLET_OVERDRAFT_LIMIT = 150;
