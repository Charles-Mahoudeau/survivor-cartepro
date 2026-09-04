import 'server-only';

import { forbidden, redirect } from 'next/navigation';

import { ECODES } from '@/lib/api/clients';
import { toHook } from '@/lib/api/helpers/toHook';
import { listPartnerCategories } from '@/lib/api/routes/partner-category';

export const listPartnerCategoriesHook = toHook(
  'listPartnerCategories',
  listPartnerCategories,
  {
    onError: (error) => {
      if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
        redirect('/login');
      }
      if (error === ECODES.FORBIDDEN_ROLE) {
        forbidden();
      }
      throw new Error(error);
    },
  },
);
