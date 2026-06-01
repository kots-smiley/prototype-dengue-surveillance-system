import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const textareaId = id || rest.name;
    return (
      <div>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea id={textareaId} ref={ref} className={`input ${className}`} {...rest} />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
