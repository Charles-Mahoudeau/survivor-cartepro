import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:public';

/**
 * Opts a route out of `SessionGuard`.
 *
 * The guard is registered globally, so protection is the default and exposure
 * is the annotation. The reverse — a global guard that only protects annotated
 * routes — leaves a controller open by omission, and an omission is exactly
 * what a review does not see.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
