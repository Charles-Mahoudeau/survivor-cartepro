export function SidebarUser({
  name,
  roleLabel,
}: {
  name: string;
  roleLabel: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--secondary)] font-display text-xs font-semibold text-[color:var(--primary)]"
        aria-hidden="true"
      >
        {name.charAt(0)}
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-xs font-semibold text-[color:var(--foreground)]">
          {name}
        </div>
        <div className="font-display text-[10px] text-[color:var(--muted-foreground)]">
          {roleLabel}
        </div>
      </div>
    </div>
  );
}
