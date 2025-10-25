
import React from 'react';

interface GeminiInsightProps {
  insight: string | null;
  isLoading: boolean;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
    </div>
);

export const GeminiInsight: React.FC<GeminiInsightProps> = ({ insight, isLoading }) => {
  if (!isLoading && !insight) {
    return null;
  }

  return (
    <div className="mt-6 bg-blue-50 dark:bg-slate-800/50 border-l-4 border-blue-400 dark:border-blue-600 p-5 rounded-r-lg shadow-sm">
      <div className="flex items-center mb-2">
        <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Did you know?</h3>
      </div>
      <div className="text-blue-700 dark:text-slate-300 animate-fade-in">
        {isLoading ? <LoadingSkeleton /> : <p>{insight}</p>}
      </div>
       <p className="text-right text-xs text-slate-400 dark:text-slate-500 mt-3 italic">- Powered by Gemini</p>
    </div>
  );
};
