import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'primary' | 'danger' | 'success';
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-gray-900',
  primary: 'text-primary-600',
  danger: 'text-red-600',
  success: 'text-green-600',
};

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <section className="card" aria-label={label}>
      <h3 className="text-sm font-medium text-slate-600">{label}</h3>
      <p className={`mt-2 text-3xl font-bold ${toneClass[tone]}`}>{value}</p>
      {hint && <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>}
    </section>
  );
}
