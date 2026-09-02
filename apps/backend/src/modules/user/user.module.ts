import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, RateLimit, Session, User, Verification } from './entities';

/**
 * Owns the five tables authentication runs on.
 *
 * The module exists first of all to register the entities: `autoLoadEntities`
 * only sees what a `forFeature` declares, and an entity the connection never
 * hears about is an entity `db:generate` will propose to drop.
 *
 * It exposes no repository yet. Better Auth reads and writes these tables
 * through its own connection, and no route of this API reads them — the day one
 * does, the repository is added here rather than the ORM being reached for from
 * a service.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, Account, Verification, RateLimit]),
  ],
  exports: [TypeOrmModule],
})
export class UserModule {}
