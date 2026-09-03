import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:public';

/**
 * Opts a route out of `SessionGuard`.
 *
 * Protection is the default and exposure is the annotation: the reverse leaves
 * a controller open by omission, and an omission does not show up in review.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
