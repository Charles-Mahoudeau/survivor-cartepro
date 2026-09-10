import 'server-only';

import * as allocation from './allocation';
import * as employer from './employer';
import * as geocoding from './geocoding';
import * as partner from './partner';
import * as partnerApplication from './partner-application';
import * as partnerCategory from './partner-category';
import * as paymentToken from './payment-token';
import * as payment from './payment';
import * as wallet from './wallet';

/** One namespace per resource; a screen never imports a route module directly. */
export const api = {
  wallet,
  geocoding,
  partner,
  partnerCategory,
  partnerApplication,
  paymentToken,
  payment,
  allocation,
  employer,
};
