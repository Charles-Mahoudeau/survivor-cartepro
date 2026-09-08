import { APIError } from 'better-auth';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { handleUserCreated } from '../user-created.handler';

const USER_ID = 'a-user-id';

describe('handleUserCreated', () => {
  it('only creates the wallet when that succeeds', async () => {
    const deleteUserCalls: string[] = [];
    await handleUserCreated(USER_ID, {
      createWallet: (id) => {
        expect(id).toBe(USER_ID);
        return Promise.resolve();
      },
      deleteUser: (id) => {
        deleteUserCalls.push(id);
        return Promise.resolve();
      },
    });

    expect(deleteUserCalls).toEqual([]);
  });

  it('removes the account and fails when the wallet cannot be created', async () => {
    const deleteUserCalls: string[] = [];

    await expect(
      handleUserCreated(USER_ID, {
        createWallet: () =>
          Promise.reject(new Error('database is unreachable')),
        deleteUser: (id) => {
          deleteUserCalls.push(id);
          return Promise.resolve();
        },
      }),
    ).rejects.toMatchObject({
      status: 'INTERNAL_SERVER_ERROR',
      body: { code: ERROR_CODES.WALLET_CREATION_FAILED },
    });

    expect(deleteUserCalls).toEqual([USER_ID]);
  });

  it('still fails with the wallet error when the account cannot be removed either', async () => {
    await expect(
      handleUserCreated(USER_ID, {
        createWallet: () =>
          Promise.reject(new Error('database is unreachable')),
        deleteUser: () =>
          Promise.reject(new Error('cannot reach the user table either')),
      }),
    ).rejects.toBeInstanceOf(APIError);
  });
});
