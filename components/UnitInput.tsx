import React from 'react';

interface UnitInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  preview?: string | null;
}

export const UnitInput: React.FC<UnitInputProps> = ({ label, value, onValueChange, placeholder, preview }) => {
  return (
    <div>
      <label htmlFor={label} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        id={label}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="block w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 dark:text-slate-100 shadow-sm"
        placeholder={placeholder}
        aria-label={`${label} value and unit`}
      />
      {preview && value.trim() && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-1" aria-live="polite">
          <span className="font-semibold">Parsed as:</span> {preview}
        </p>
      )}
    </div>
  );
};