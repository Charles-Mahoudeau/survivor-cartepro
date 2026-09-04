import 'server-only';

import * as partner from './partner';
import * as partnerCategory from './partner-category';
import * as wallet from './wallet';

/** One namespace per resource; a screen never imports a route module directly. */
export const api = {
  wallet,
  partner,
  partnerCategory,
};
