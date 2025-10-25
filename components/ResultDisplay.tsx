
import React from 'react';

interface ResultDisplayProps {
  result: string | null;
  error: string | null;
  isLoading: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, error, isLoading }) => {
  if (isLoading || error || result) {
    return (
      <div className="mt-6 p-4 rounded-lg min-h-[80px] flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
        {error && <p className="text-red-500 dark:text-red-400 text-center font-medium">{error}</p>}
        {result && !error && (
          <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center">
            <span className="text-slate-500 dark:text-slate-400 font-normal">= </span>
            {result}
          </p>
        )}
      </div>
    );
  }
  return null;
};
