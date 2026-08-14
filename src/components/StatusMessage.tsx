export function LoadingState() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[60px] animate-pulse rounded-xl border border-border bg-surface" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface py-10 text-center">
      <span className="text-2xl">⚠️</span>
      <p className="px-6 text-sm text-neutral-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full border border-border px-4 py-1.5 text-sm text-neutral-300"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
      <span className="text-2xl">⚽</span>
      <p className="px-6 text-sm text-neutral-500">{message}</p>
    </div>
  );
}
