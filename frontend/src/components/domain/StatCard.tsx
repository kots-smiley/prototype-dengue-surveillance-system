import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'primary' | 'danger' | 'success';
  icon?: ReactNode;
  index?: number;
}

const toneText: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-slate-900 dark:text-slate-100',
  primary: 'text-primary-600 dark:text-primary-400',
  danger: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
};

const toneAccent: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'from-slate-400 to-slate-500',
  primary: 'from-primary-400 to-primary-600',
  danger: 'from-red-400 to-red-600',
  success: 'from-green-400 to-green-600',
};

export function StatCard({ label, value, hint, tone = 'default', icon, index = 0 }: StatCardProps) {
  return (
    <motion.section
      className="surface relative overflow-hidden p-5"
      aria-label={label}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(index * 0.06, 0.3) }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${toneAccent[tone]}`} aria-hidden />
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</h3>
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
      </div>
      <p className={`mt-2 text-3xl font-bold ${toneText[tone]}`}>
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </p>
      {hint && <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{hint}</p>}
    </motion.section>
  );
}
