import { Injectable } from '@nestjs/common';
import type { Role } from '@/config/auth/auth.constants';
import type { User } from '../entities';
import { UserRepo } from '../repos/user.repo';

/**
 * What other modules are allowed to know about an account.
 *
 * It is deliberately thin today. The point is not the logic it holds but the
 * boundary it draws: the partner module will depend on this service, never on
 * `UserRepo`, so this module keeps the right to change how accounts are stored
 * without every consumer following. A module that exported its repository would
 * have published its schema instead of its behaviour.
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * Several accounts in one query, for a payload that carries owners. Prefer it
   * over a loop of `findById` — the cost of a read path is counted as a
   * function of N before it is served.
   */
  findManyByIds(ids: string[]): Promise<User[]> {
    return this.userRepo.findManyByIds(ids);
  }

  /**
   * Grants a role. `false` means no account carried that id.
   *
   * The role is not checked against the session here: this is the domain
   * operation, and who is allowed to call it is the caller's guard. Today the
   * only caller is the promotion script, which runs with a shell, not a
   * session.
   */
  setRole(id: string, role: Role): Promise<boolean> {
    return this.userRepo.setRole(id, role);
  }
}
