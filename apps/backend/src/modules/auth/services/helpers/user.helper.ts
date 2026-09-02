import { ROLES } from '@/config/auth/auth.constants';
import type { SessionUserDto } from '../../validators/auth.dto';

/**
 * The subset of a Better Auth user this API puts on the wire.
 *
 * Written as an explicit projection, never a spread. `ClassSerializerInterceptor`
 * only filters real class instances, and the objects the library returns are
 * plain — so a spread would publish `banReason`, `banExpires` and every column a
 * future plugin adds, and nothing in the response path would stop it.
 */
export function toSessionUser(user: {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  emailVerified: boolean;
  createdAt: Date;
}): SessionUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? ROLES.USER,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}
