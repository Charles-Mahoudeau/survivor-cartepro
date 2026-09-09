import type { AuditService } from '@/modules/audit/services/audit.service';
import type { UserService } from '@/modules/user/services/user.service';
import type { WalletService } from '@/modules/wallets/services/wallet.service';

/**
 * `auth.ts` builds its `betterAuth` instance before Nest boots, so its hooks
 * can't call `app.get(...)` directly. `configureApp` registers the real
 * services here once the container is up, and the hooks read them back at
 * request time — by then the app is always fully booted.
 */
export interface AuthProvisioningServices {
  walletService: WalletService;
  userService: UserService;
  auditService: AuditService;
}

let services: AuthProvisioningServices | undefined;

export function registerAuthProvisioning(deps: AuthProvisioningServices): void {
  services = deps;
}

export function getAuthProvisioning(): AuthProvisioningServices {
  if (!services) {
    throw new Error(
      'Auth provisioning services were never registered — configureApp must run first.',
    );
  }
  return services;
}
