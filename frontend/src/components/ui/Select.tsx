import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = '', children, ...rest }, ref) => {
    const selectId = id || rest.name;
    const hasError = Boolean(error);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="input-label">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={hasError}
          className={`input ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="input-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
