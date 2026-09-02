import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import type { AuthUser } from '@/config/auth/auth';
import { ROLES } from '@/config/auth/auth.constants';

/**
 * A consumer for the guards, declared by the test module only.
 *
 * The guards are global infrastructure with no business route to protect yet,
 * so the suite supplies one — the same three shapes a real route will take: no
 * annotation, a role requirement, and an explicit opt-out. It is not a mock of
 * anything: the guards, the decorators and the session lookup underneath are
 * all the real ones. The day a business module exists, its routes exercise the
 * same code and this can go.
 */
@Controller('probe')
export class ProbeController {
  /** Authentication required, any role. */
  @Get('any')
  any(@CurrentUser() user: AuthUser) {
    return { id: user.id, email: user.email, role: user.role };
  }

  /** Administration only. */
  @Get('admin')
  @Roles(ROLES.ADMIN)
  admin(@CurrentUser() user: AuthUser) {
    return { role: user.role };
  }

  /** Opted out, like `/health`. */
  @Get('open')
  @Public()
  open() {
    return { ok: true };
  }
}
