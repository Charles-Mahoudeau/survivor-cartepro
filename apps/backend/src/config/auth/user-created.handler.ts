import { APIError } from 'better-auth';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export interface UserCreatedDeps {
  createWallet: (userId: string) => Promise<unknown>;
  deleteUser: (userId: string) => Promise<void>;
}

/**
 * Every account must have a wallet. Better Auth commits the user through its
 * own connection before this runs, so a failure here can't roll that insert
 * back — it removes the account instead (cascading to its session and
 * account rows) and fails the request, rather than leaving a wallet-less
 * account able to sign in.
 */
export async function handleUserCreated(
  userId: string,
  deps: UserCreatedDeps,
): Promise<void> {
  try {
    await deps.createWallet(userId);
  } catch (error) {
    await deps.deleteUser(userId).catch((cleanupError: unknown) => {
      console.error(
        'Failed to remove the account after wallet creation failed',
        cleanupError,
      );
    });
    console.error('Wallet creation failed during sign-up', error);
    throw new APIError('INTERNAL_SERVER_ERROR', {
      code: ERROR_CODES.WALLET_CREATION_FAILED,
      message: 'Could not create a wallet for this account.',
    });
  }
}
