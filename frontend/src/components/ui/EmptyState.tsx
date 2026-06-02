import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = '📋', title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      <div className="mb-4 text-4xl" aria-hidden>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mx-auto mb-5 max-w-xl text-sm text-slate-600">{description}</p>}
      {action}
    </div>
  );
}
