export function BlocMarque({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 select-none" aria-label="République Française">
      {}
      <div className="flex flex-col shrink-0">
        <div className="flex h-full">
          <div className={`${compact ? "w-1" : "w-1.5"} ${compact ? "h-7" : "h-9"} bg-[#002395]`} />
          <div className={`${compact ? "w-1" : "w-1.5"} ${compact ? "h-7" : "h-9"} bg-white border-y border-[#E8E8E8]`} />
          <div className={`${compact ? "w-1" : "w-1.5"} ${compact ? "h-7" : "h-9"} bg-[#ED2939]`} />
        </div>
      </div>
      <div>
        <div className={`font-display font-bold text-[color:var(--primary)] leading-tight ${compact ? "text-xs" : "text-sm"} tracking-wide uppercase`}>
          République
        </div>
        <div className={`font-display font-bold text-[color:var(--primary)] leading-tight ${compact ? "text-xs" : "text-sm"} tracking-wide uppercase`}>
          Française
        </div>
        {!compact && (
          <div className="font-display text-[10px] text-[color:var(--muted-foreground)] tracking-widest uppercase mt-0.5">
            Ticket Tout
          </div>
        )}
      </div>
    </div>
  );
}
