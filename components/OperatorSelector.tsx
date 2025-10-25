
import React from 'react';
import { Operator } from '../types';

interface OperatorSelectorProps {
  operator: Operator;
  onOperatorChange: (operator: Operator) => void;
}

const operatorSymbols: { [key in Operator]: string } = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({ operator, onOperatorChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-center">
        Op
      </label>
      <div className="relative">
        <select
          value={operator}
          onChange={(e) => onOperatorChange(e.target.value as Operator)}
          className="appearance-none w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-2 pl-3 pr-8 rounded-md shadow-sm text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(operatorSymbols).map(([op, symbol]) => (
            <option key={op} value={op} className="font-bold">
              {symbol}
            </option>
          ))}
        </select>
         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};
