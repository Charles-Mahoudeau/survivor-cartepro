interface IconProps {
  className?: string;
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
} as const;

export function IconWallet({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
      <path d="M2 9h20" />
    </svg>
  );
}

export function IconHistory({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export function IconMap({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </svg>
  );
}

export function IconLogout({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconSearch({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function IconArrowDown({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} {...STROKE} strokeWidth={2}>
      <path d="M12 5v14" />
      <path d="m5 12 7 7 7-7" />
    </svg>
  );
}

export function IconArrowUp({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} {...STROKE} strokeWidth={2}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
