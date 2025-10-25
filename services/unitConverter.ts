import { Operator, UnitId } from '../types';
import { UNITS, BASE_UNITS, UnitCategory } from '../constants';

const unitLookup = new Map<string, UnitId>();
Object.entries(UNITS).forEach(([id, unit]) => {
    unitLookup.set(id.toLowerCase(), id as UnitId);
    unitLookup.set(unit.symbol.toLowerCase(), id as UnitId);
    unitLookup.set(unit.name.toLowerCase(), id as UnitId);
    // Add basic pluralization for convenience
    if (!unit.name.toLowerCase().endsWith('s')) {
        unitLookup.set(unit.name.toLowerCase() + 's', id as UnitId);
    }
});

export const parseUnitString = (input: string): { value: number; category: UnitCategory; units: UnitId[] } => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
        throw new Error("Input is empty.");
    }
    
    // Shorthand parser for "X Y Z/W" format (interpreted as X ft Y Z/W in)
    const shorthandRegex = /^\s*(\d*\.?\d+)\s+(\d*\.?\d+)(?:\s+(\d+)\/(\d+))?\s*$/;
    const shorthandMatch = trimmedInput.match(shorthandRegex);

    if (shorthandMatch) {
        const feet = parseFloat(shorthandMatch[1]);
        const inches = parseFloat(shorthandMatch[2]);
        let fraction = 0;
        if (shorthandMatch[3] && shorthandMatch[4]) {
            const numerator = parseInt(shorthandMatch[3], 10);
            const denominator = parseInt(shorthandMatch[4], 10);
            if (denominator === 0) {
                throw new Error("Fraction denominator cannot be zero.");
            }
            fraction = numerator / denominator;
        }

        const totalValueInBase = (feet * UNITS['ft'].to_base) + inches + fraction;
        return { value: totalValueInBase, category: UnitCategory.LENGTH, units: ['ft', 'in'] };
    }

    const regex = /(\d*\.?\d+)\s*([a-zA-Z²]+)/g;
    let match;
    let totalValueInBase = 0;
    let detectedCategory: UnitCategory | null = null;
    const foundUnits: UnitId[] = [];
    let lastIndex = 0;

    if (/^\d*\.?\d+$/.test(trimmedInput)) {
        throw new Error("Input must include units (e.g., '5 ft', '120 lbs').");
    }

    while ((match = regex.exec(trimmedInput)) !== null) {
        lastIndex = regex.lastIndex;
        const value = parseFloat(match[1]);
        const unitStr = match[2].toLowerCase();

        const unitId = unitLookup.get(unitStr);
        if (!unitId) {
            throw new Error(`Unit '${match[2]}' is not recognized.`);
        }
        
        const unit = UNITS[unitId];
        const currentCategory = unit.category as UnitCategory;

        if (detectedCategory === null) {
            detectedCategory = currentCategory;
        } else if (currentCategory !== detectedCategory) {
            throw new Error('All units in one input must be from the same category (e.g., all Length).');
        }

        totalValueInBase += value * unit.to_base;
        if (!foundUnits.includes(unitId)) {
            foundUnits.push(unitId);
        }
    }
    
    if (lastIndex === 0 || trimmedInput.substring(lastIndex).trim() !== '') {
         throw new Error("Invalid format. Use number-unit pairs like '5 ft 6 in'.");
    }

    return { value: totalValueInBase, category: detectedCategory!, units: foundUnits };
};


const formatLength = (valueInInches: number): string => {
  if (Math.abs(valueInInches) < 1e-9) return "0 in";

  const sign = valueInInches < 0 ? '- ' : '';
  let absValue = Math.abs(valueInInches);

  const parts = [];
  
  const feet = Math.floor(absValue / UNITS['ft'].to_base);
  if (feet > 0) {
    parts.push(`${feet} ft`);
    absValue %= UNITS['ft'].to_base;
  }
  
  const inches = absValue;
  if (inches > 1e-9) {
    parts.push(`${parseFloat(inches.toPrecision(4))} in`);
  }

  return sign + (parts.length > 0 ? parts.join(' ') : "0 in");
};

export const formatValue = (value: number, category: UnitCategory): string => {
    if (category === UnitCategory.LENGTH) {
        return formatLength(value);
    }
    
    const baseUnitId = BASE_UNITS[category];

    const categoryUnits = Object.values(UNITS)
        .filter(u => u.category === category)
        .sort((a, b) => b.to_base - a.to_base);

    for (const unit of categoryUnits) {
        if (Math.abs(value) >= unit.to_base) {
            const convertedValue = value / unit.to_base;
            return `${parseFloat(convertedValue.toPrecision(6))} ${unit.symbol}`;
        }
    }
    return `${parseFloat(value.toPrecision(6))} ${UNITS[baseUnitId].symbol}`;
}


export const calculate = (
  op1: { value: number, category: UnitCategory },
  op2: { value: number, category: UnitCategory },
  operator: Operator
): string => {

  let resultValue: number;

  switch (operator) {
    case '+':
    case '-':
      if (op1.category !== op2.category) {
        throw new Error('Cannot add or subtract units from different categories.');
      }
      resultValue = operator === '+' ? op1.value + op2.value : op1.value - op2.value;
      return formatValue(resultValue, op1.category);
    
    case '*':
      resultValue = op1.value * op2.value;
      if (op1.category === UnitCategory.LENGTH && op2.category === UnitCategory.LENGTH) {
        return formatValue(resultValue, UnitCategory.AREA);
      }
      const baseUnit1 = UNITS[BASE_UNITS[op1.category]];
      const baseUnit2 = UNITS[BASE_UNITS[op2.category]];
      return `${parseFloat(resultValue.toPrecision(6))} ${baseUnit1.symbol} × ${baseUnit2.symbol}`;

    case '/':
      if (op2.value === 0) {
        throw new Error('Cannot divide by zero.');
      }
      resultValue = op1.value / op2.value;
      if (op1.category === op2.category) {
        return resultValue.toPrecision(6);
      }
      const base1 = UNITS[BASE_UNITS[op1.category]].symbol;
      const base2 = UNITS[BASE_UNITS[op2.category]].symbol;
      return `${resultValue.toPrecision(6)} ${base1}/${base2}`;
      
    default:
      throw new Error(`Invalid operator '${operator}'.`);
  }
};