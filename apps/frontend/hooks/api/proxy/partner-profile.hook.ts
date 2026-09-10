import 'server-only';

import { forbidden, notFound, redirect } from 'next/navigation';

import { ECODES } from '@/lib/api/clients';
import { toHook } from '@/lib/api/helpers/toHook';
import { getMyPartnerProfile } from '@/lib/api/routes/partner';
import { throwNextError } from '@/lib/log';

/** The dossier of the signed-in partner, or the 404 view when its account carries none. */
export const getMyPartnerProfileHook = toHook(
  'getMyPartnerProfile',
  getMyPartnerProfile,
  {
    onError: (error) => {
      if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
        redirect('/login');
      }
      if (error === ECODES.FORBIDDEN_ROLE) {
        forbidden();
      }
      if (error === ECODES.PARTNER_NOT_FOUND) {
        notFound();
      }
      throwNextError(
        new Error(error),
        'getMyPartnerProfile hook returned an error',
      );
    },
  },
);
