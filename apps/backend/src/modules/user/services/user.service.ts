import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import type { Role } from '@/config/auth/auth.constants';
import type { User } from '../entities';
import { UserRepo } from '../repos/user.repo';

/**
 * What other modules are allowed to know about an account.
 *
 * Thin on purpose: the point is the boundary. The partner module depends on
 * this service, never on `UserRepo`, so this one keeps the right to change how
 * accounts are stored. A module that exported its repository would have
 * published its schema instead of its behaviour.
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

  /** Several accounts in one query. Prefer it over a loop of `findById`. */
  findManyByIds(ids: string[]): Promise<User[]> {
    return this.userRepo.findManyByIds(ids);
  }

  /**
   * Grants a role. `false` means no account carried that id. Who is allowed to
   * call it is the caller's guard, not this method. Pass a manager to have the
   * write join a caller-provided transaction.
   */
  setRole(id: string, role: Role, manager?: EntityManager): Promise<boolean> {
    return this.userRepo.setRole(id, role, manager);
  }

  /** Used to undo a registration whose wallet could not be created. */
  remove(id: string): Promise<void> {
    return this.userRepo.deleteById(id);
  }
}
