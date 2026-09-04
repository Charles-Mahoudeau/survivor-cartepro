import {
  createGetHtmlAttributes,
  DsfrHeadBase,
  type DsfrHeadProps,
} from '@codegouvfr/react-dsfr/next-app-router/server-only-index';
import Link from 'next/link';

import { DEFAULT_COLOR_SCHEME } from './color-scheme';

export const { getHtmlAttributes } = createGetHtmlAttributes({
  defaultColorScheme: DEFAULT_COLOR_SCHEME,
});

export function DsfrHead(props: DsfrHeadProps) {
  return <DsfrHeadBase Link={Link} {...props} />;
}
