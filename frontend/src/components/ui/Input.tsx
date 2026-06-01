import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input id={inputId} ref={ref} className={`input ${className}`} {...rest} />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
