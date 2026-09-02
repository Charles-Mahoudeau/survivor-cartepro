import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Account,
  ApiKey,
  RateLimit,
  Session,
  User,
  Verification,
} from './entities';
import { UserRepo } from './repos/user.repo';
import { UserService } from './services/user.service';

/**
 * Owns the five tables authentication runs on.
 *
 * `forFeature` is what registers the entities: `autoLoadEntities` only sees what
 * a feature module declares, and an entity the connection never hears about is
 * an entity `db:generate` will propose to drop.
 *
 * Only `UserService` is exported. `UserRepo` stays in — the rule that a module
 * depends on the services of another, never on its repositories, is only worth
 * anything if the repository is not reachable in the first place.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Session,
      Account,
      Verification,
      RateLimit,
      ApiKey,
    ]),
  ],
  providers: [UserRepo, UserService],
  exports: [UserService],
})
export class UserModule {}
