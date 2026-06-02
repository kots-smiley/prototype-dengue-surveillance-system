import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const textareaId = id || rest.name;
    const hasError = Boolean(error);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="input-label">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
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

Textarea.displayName = 'Textarea';
