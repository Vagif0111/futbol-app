export function LoadingState() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[84px] animate-pulse rounded-2xl border border-border bg-surface" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-10 text-center shadow-card">
      <span className="text-2xl">⚠️</span>
      <p className="px-6 text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full border border-border px-4 py-1.5 text-sm text-ink"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface py-10 text-center">
      <span className="text-2xl">⚽</span>
      <p className="px-6 text-sm text-muted">{message}</p>
    </div>
  );
}
