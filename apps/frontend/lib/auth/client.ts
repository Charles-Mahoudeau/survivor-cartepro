import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

import { AUTH_BASE_PATH } from './constants';

/**
 * The browser client.
 *
 * No baseURL on purpose: in a browser Better Auth resolves
 * `window.location.origin + basePath`, so one build serves every hostname and
 * no public URL has to be baked in. The edge routes /auth to the API, which
 * keeps the session cookie first-party and takes CORS out of the picture.
 */
export const authClient = createAuthClient({
  basePath: AUTH_BASE_PATH,
  plugins: [adminClient()],
});
