'use client';

import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiLoader4Line,
} from '@remixicon/react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <RiCheckboxCircleLine className="size-4" />,
        info: <RiInformationLine className="size-4" />,
        warning: <RiErrorWarningLine className="size-4" />,
        error: <RiCloseCircleLine className="size-4" />,
        loading: <RiLoader4Line className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'font-display text-sm',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--border)',
          '--error-bg': 'var(--card)',
          '--error-text': 'var(--destructive)',
          '--error-border': 'var(--destructive)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
