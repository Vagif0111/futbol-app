export function LiveBadge({ minute }: { minute: number | null }) {
  return (
    <span className="flex items-center gap-1 rounded bg-live/15 px-1.5 py-0.5 text-[11px] font-medium text-live">
      <span className="h-1.5 w-1.5 rounded-full bg-live" />
      {minute != null ? `${minute}'` : "CANLI"}
    </span>
  );
}
