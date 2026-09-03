import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@/common/guards/roles.guard';
import { SessionGuard } from '@/common/guards/session.guard';

/**
 * Turns authentication on for the whole application.
 *
 * It declares no controller: signing up, in and out are routes Better Auth
 * already serves, which the frontend calls directly. What Nest needs is the
 * pair of guards, so every business route added later is protected by default.
 *
 * The order below is the order Nest runs them — `SessionGuard` first, because
 * `RolesGuard` reads the session it attaches. Swapped, every role check sees an
 * undefined role and refuses everything.
 *
 * `@Global` because the guards resolve from this module's injector.
 */
@Global()
@Module({
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
