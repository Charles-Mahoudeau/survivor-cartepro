import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[color:var(--card)] border border-[color:var(--border)] rounded-[var(--radius)] ${className}`}
    >
      {children}
    </div>
  );
}
