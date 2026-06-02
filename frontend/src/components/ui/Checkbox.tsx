import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className = '', ...rest }, ref) => {
    const checkboxId = id || rest.name;
    return (
      <label
        htmlFor={checkboxId}
        className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
      >
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 ${className}`}
          {...rest}
        />
        <span>{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
