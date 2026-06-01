interface SpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export function Spinner({ label = 'Loading...', fullScreen = false }: SpinnerProps) {
  const content = (
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
      <div className="text-lg text-gray-600">{label}</div>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center">{content}</div>;
  }
  return <div className="py-12 flex items-center justify-center">{content}</div>;
}
