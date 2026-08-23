import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border ${
            error
              ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3.5 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
            icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
