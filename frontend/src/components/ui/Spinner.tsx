interface SpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export function Spinner({ label = 'Loading...', fullScreen = false }: SpinnerProps) {
  const content = (
    <div className="text-center">
      <div className="mb-3 inline-block h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-400" />
      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-screen items-center justify-center">{content}</div>;
  }
  return <div className="flex items-center justify-center py-12">{content}</div>;
}
