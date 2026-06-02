import { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

const toneClass: Record<Tone, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
};

export function Badge({ tone = 'info', children }: BadgeProps) {
  return <span className={`badge ${toneClass[tone]}`}>{children}</span>;
}
