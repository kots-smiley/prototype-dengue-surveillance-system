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
    <div className="card">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className={`text-3xl font-bold ${toneClass[tone]}`}>{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
