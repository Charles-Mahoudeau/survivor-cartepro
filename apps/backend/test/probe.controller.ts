import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import type { AuthUser } from '@/config/auth/auth';
import { ROLES } from '@/config/auth/auth.constants';

/**
 * A consumer for the guards, declared by the test module only — the three
 * shapes a real route takes. Nothing here is a mock: the guards, decorators and
 * session lookup underneath are the real ones.
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
