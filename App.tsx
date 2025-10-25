import React, { useState, useCallback, useEffect } from 'react';
import { UnitInput } from './components/UnitInput';
import { OperatorSelector } from './components/OperatorSelector';
import { ResultDisplay } from './components/ResultDisplay';
import { GeminiInsight } from './components/GeminiInsight';
import { Operator } from './types';
import { parseUnitString, calculate, formatValue } from './services/unitConverter';
import { getUnitInsight } from './services/geminiService';

const App: React.FC = () => {
  const [input1, setInput1] = useState<string>('5 3');
  const [input2, setInput2] = useState<string>('1 10 1/2');
  const [operator, setOperator] = useState<Operator>('+');
  
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isFetchingInsight, setIsFetchingInsight] = useState<boolean>(false);

  const generatePreview = useCallback((input: string, setPreview: (p: string | null) => void) => {
    if (!input.trim()) {
      setPreview(null);
      return;
    }
    try {
      const parsed = parseUnitString(input);
      const formatted = formatValue(parsed.value, parsed.category);
      setPreview(formatted);
    } catch (e) {
      setPreview(null);
    }
  }, []);

  useEffect(() => {
    generatePreview(input1, setPreview1);
  }, [input1, generatePreview]);

  useEffect(() => {
    generatePreview(input2, setPreview2);
  }, [input2, generatePreview]);


  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    setError(null);
    setResult(null);
    setInsight(null);

    try {
      const parsed1 = parseUnitString(input1);
      const parsed2 = parseUnitString(input2);

      const calcResult = calculate(parsed1, parsed2, operator);
      setResult(calcResult);
      
      setIsFetchingInsight(true);
      const allUnits = [...new Set([...parsed1.units, ...parsed2.units])];
      const geminiInsight = await getUnitInsight(input1, input2, operator, calcResult, allUnits);
      setInsight(geminiInsight);

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsCalculating(false);
      setIsFetchingInsight(false);
    }
  }, [input1, input2, operator]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            US Unit Calculator
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Calculate with US units and learn something new.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <UnitInput
                label="Value 1"
                value={input1}
                onValueChange={setInput1}
                placeholder="e.g., 5 6 1/2 or 5ft 6in"
                preview={preview1}
              />
            </div>
            
            <div className="flex items-center justify-center">
              <OperatorSelector operator={operator} onOperatorChange={setOperator} />
            </div>

            <div className="md:col-span-2">
              <UnitInput
                label="Value 2"
                value={input2}
                onValueChange={setInput2}
                placeholder="e.g., 2 ft"
                preview={preview2}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-200 flex items-center justify-center shadow-md disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </>
              ) : 'Calculate'}
            </button>
          </div>
          
          <ResultDisplay result={result} error={error} isLoading={isCalculating} />
          
        </main>
        
        <GeminiInsight insight={insight} isLoading={isFetchingInsight} />
        
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>Powered by React, Tailwind CSS, and the Google Gemini API.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;