import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './controllers/auth.controller';
import { RolesGuard } from './guards/roles.guard';
import { SessionGuard } from './guards/session.guard';
import { AuthService } from './services/auth.service';
import { AuthMigrationService } from './services/helpers/migration.service';

/**
 * Wires authentication into the application.
 *
 * `@Global` because the two guards are registered as `APP_GUARD`: Nest
 * instantiates them from this module's injector, and they must resolve
 * `AuthService` wherever a controller lives.
 *
 * The order of the two `APP_GUARD` providers is the order Nest runs them.
 * `SessionGuard` first, because `RolesGuard` reads the session it attaches —
 * swapping them makes every role check see an undefined role and refuse
 * everything, which a test that only covers the happy path would not catch.
 */
@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthMigrationService,
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
