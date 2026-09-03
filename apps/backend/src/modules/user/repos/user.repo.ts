import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Role } from '@/config/auth/auth.constants';
import { User } from '../entities';

/**
 * The only place in this application that queries the account tables. Better
 * Auth reads them too, through its own connection, running its own flows.
 *
 * It imports entities and nothing else: a repository that needs a service is
 * doing orchestration that belongs to the layer above it.
 */
@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  /**
   * Lowercased first: Better Auth stores every address that way, and the column
   * is plain `text`. Looking one up as it was typed finds nothing.
   */
  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  /**
   * Several accounts in one query, so a list that carries owners never resolves
   * them one at a time. An empty input short-circuits: `IN ()` is not valid SQL.
   */
  async findManyByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.users.find({ where: { id: In(ids) } });
  }

  /** Returns whether a row moved, so a caller can tell "no such account". */
  async setRole(id: string, role: Role): Promise<boolean> {
    const result = await this.users.update({ id }, { role });
    return (result.affected ?? 0) > 0;
  }
}
