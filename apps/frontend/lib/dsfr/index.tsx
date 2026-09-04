'use client';

import {
  DsfrProviderBase,
  type DsfrProviderProps,
  StartDsfrOnHydration,
} from '@codegouvfr/react-dsfr/next-app-router';
import Link from 'next/link';

import { DEFAULT_COLOR_SCHEME } from './color-scheme';

declare module '@codegouvfr/react-dsfr/next-app-router' {
  interface RegisterLink {
    Link: typeof Link;
  }
}

export function DsfrProvider(props: DsfrProviderProps) {
  return (
    <DsfrProviderBase
      defaultColorScheme={DEFAULT_COLOR_SCHEME}
      Link={Link}
      {...props}
    />
  );
}

export { StartDsfrOnHydration };
