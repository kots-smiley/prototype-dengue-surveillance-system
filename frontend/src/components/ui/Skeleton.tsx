interface SkeletonProps {
  className?: string;
}

/** Shimmer placeholder used while data loads (keeps perceived latency low). */
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** A small stack of skeleton lines for list/card placeholders. */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
