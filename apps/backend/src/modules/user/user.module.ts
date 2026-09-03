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
 * Owns the six tables authentication runs on. `forFeature` is what registers
 * them: an entity the connection never hears about is one `db:generate` drops.
 *
 * Only `UserService` is exported — the rule that a module depends on services
 * and not repositories is worth something only if the repository is out of
 * reach.
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
