import type { ReactNode } from 'react';

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: ReactNode;
}
