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
        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
      >
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${className}`}
          {...rest}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
