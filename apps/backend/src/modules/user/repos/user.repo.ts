import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Role } from '@/config/auth/auth.constants';
import { User } from '../entities';

/**
 * The only place in this application that queries the account tables.
 *
 * Better Auth reads and writes them too, through its own connection, but that
 * is the library running its own flows. Everything this codebase does with an
 * account goes through here — a service that reached for `Repository<User>`
 * would put a second query path next to this one, and the day a column moves
 * only one of them would follow.
 *
 * It imports entities and nothing else: no service, no other repo. A repository
 * that needs one is a repository doing orchestration that belongs to the layer
 * above it.
 */
@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  /**
   * Resolves several accounts in one query.
   *
   * This exists so a list that carries owners never resolves them one at a
   * time: the cost of a read path is counted as a function of N, and a
   * `findById` inside a `map` is how a partner listing turns into one query per
   * row. An empty input short-circuits — `IN ()` is not valid SQL.
   */
  async findManyByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.users.find({ where: { id: In(ids) } });
  }

  /**
   * Returns whether a row actually moved, so a caller can tell "no such
   * account" from "already had that role" without reading first.
   */
  async setRole(id: string, role: Role): Promise<boolean> {
    const result = await this.users.update({ id }, { role });
    return (result.affected ?? 0) > 0;
  }
}
