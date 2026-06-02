import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id || rest.name;
    const hasError = Boolean(error);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={hasError}
          className={`input ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
          {...rest}
        />
        {error && <p className="input-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
