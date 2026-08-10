export function LoadingState() {
  return <div className="py-8 text-center text-sm text-neutral-500">Yükleniyor…</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md border border-border px-4 py-1.5 text-sm text-neutral-300"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="py-8 text-center text-sm text-neutral-500">{message}</div>;
}
