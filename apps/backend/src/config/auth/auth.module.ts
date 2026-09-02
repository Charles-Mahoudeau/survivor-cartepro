import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@/common/guards/roles.guard';
import { SessionGuard } from '@/common/guards/session.guard';

/**
 * Turns authentication on for the whole application.
 *
 * It declares no controller, and that is the point: signing up, signing in and
 * signing out are routes Better Auth already serves under `/auth`, which the
 * frontend calls directly through its own client. Re-exposing them behind a
 * NestJS controller would be a second, thinner copy of an API that already
 * exists, with a second place for its contract to drift.
 *
 * What NestJS does need is the pair of guards, so that every business route
 * added later is protected by default and can name the roles it accepts. They
 * are `APP_GUARD` providers, and the order below is the order Nest runs them:
 * `SessionGuard` first, because `RolesGuard` reads the session it attaches.
 * Swapping them makes every role check see an undefined role and refuse
 * everything, which a test that only covers the happy path would not catch.
 *
 * `@Global` because the guards are instantiated from this module's injector and
 * must resolve wherever a controller lives.
 */
@Global()
@Module({
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
