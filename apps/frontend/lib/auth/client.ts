import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

import { AUTH_BASE_PATH } from './constants';

export const authClient = createAuthClient({
  basePath: AUTH_BASE_PATH,
  plugins: [adminClient()],
});
