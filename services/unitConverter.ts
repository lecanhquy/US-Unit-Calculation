
import { Operator, UnitId } from '../types.ts';
import { UNITS, BASE_UNITS, UnitCategory } from '../constants.ts';

const unitLookup = new Map<string, UnitId>();
Object.entries(UNITS).forEach(([id, unit]) => {
    unitLookup.set(id.toLowerCase(), id as UnitId);
    unitLookup.set(unit.symbol.toLowerCase(), id as UnitId);
    unitLookup.set(unit.name.toLowerCase(), id as UnitId);
    if (!unit.name.toLowerCase().endsWith('s')) {
        unitLookup.set(unit.name.toLowerCase() + 's', id as UnitId);
    }
});

// Regex to find numbers, fractions, and unit names
const unitRegex = /(-?\d+\s*\/\s*\d+|-?\d*\.?\d+)\s*([a-zA-Z²]+)?/g;

export const parseUnitString = (input: string): { value: number; category: UnitCategory; units: UnitId[] } => {
    const trimmedInput = input.trim();
    if (!trimmedInput) throw new Error("Input is empty.");

    // Shorthand parser for "X Y Z/W" length format (e.g., 5 6 1/2 -> 5ft 6.5in)
    const shorthandRegex = /^\s*(-?\d*\.?\d+)\s+(-?\d*\.?\d+)(?:\s+(-?\d+)\s*\/\s*(\d+))?\s*$/;
    if (shorthandRegex.test(trimmedInput) && !/[a-zA-Z]/.test(trimmedInput)) {
        const match = trimmedInput.match(shorthandRegex)!;
        const feet = parseFloat(match[1]);
        const inches = parseFloat(match[2]);
        let fraction = 0;
        if (match[3] && match[4]) {
            const num = parseInt(match[3], 10);
            const den = parseInt(match[4], 10);
            if (den === 0) throw new Error("Fraction denominator cannot be zero.");
            fraction = num / den;
        }
        const totalValueInBase = (feet * UNITS['ft'].to_base) + inches + fraction;
        return { value: totalValueInBase, category: UnitCategory.LENGTH, units: ['ft', 'in'] };
    }

    let totalValueInBase = 0;
    let detectedCategory: UnitCategory | null = null;
    const foundUnits: UnitId[] = [];
    let lastIndex = 0;
    let match;

    while ((match = unitRegex.exec(trimmedInput)) !== null) {
        lastIndex = unitRegex.lastIndex;
        
        let valueStr = match[1].trim();
        let value: number;
        if (valueStr.includes('/')) {
            const [num, den] = valueStr.split('/').map(s => parseInt(s.trim(), 10));
            if (den === 0) throw new Error("Fraction denominator cannot be zero.");
            value = num / den;
        } else {
            value = parseFloat(valueStr);
        }

        const unitStr = (match[2] || '').toLowerCase();
        
        if (!unitStr) {
           if(unitRegex.exec(trimmedInput) === null) { // if it's the last number
               const lastUnit = foundUnits.length > 0 ? UNITS[foundUnits[foundUnits.length-1]] : null;
               if (lastUnit?.category === UnitCategory.LENGTH && lastUnit.symbol === 'ft') {
                  // Interpret unitless number as inches if previous was feet
                  totalValueInBase += value; // base unit for length is inches
                  if (!foundUnits.includes('in')) foundUnits.push('in');
                  continue;
               }
           }
            throw new Error("Input must include units for each value (e.g., '5 ft', '120 lbs').");
        }
        
        const unitId = unitLookup.get(unitStr);
        if (!unitId) throw new Error(`Unit '${match[2]}' is not recognized.`);
        
        const unit = UNITS[unitId];
        const currentCategory = unit.category as UnitCategory;

        if (detectedCategory === null) {
            detectedCategory = currentCategory;
        } else if (currentCategory !== detectedCategory) {
            throw new Error('All units in one input must be from the same category.');
        }

        totalValueInBase += value * unit.to_base;
        if (!foundUnits.includes(unitId)) foundUnits.push(unitId);
    }
    
    if (lastIndex === 0 || trimmedInput.substring(lastIndex).trim() !== '') {
         throw new Error("Invalid format. Use number-unit pairs like '5 ft 6 in'.");
    }

    if(detectedCategory === null) {
        throw new Error("Could not parse any units from the input.");
    }

    return { value: totalValueInBase, category: detectedCategory, units: foundUnits };
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
  
  if (absValue > 1e-9) {
    // Basic fraction conversion for common denominators
    const eighths = Math.round(absValue * 8);
    if (eighths > 0) {
        if (eighths % 8 === 0) {
            parts.push(`${eighths / 8} in`);
        } else if (eighths % 4 === 0) {
            parts.push(`${eighths / 4}/2 in`);
        } else if (eighths % 2 === 0) {
            parts.push(`${eighths / 2}/4 in`);
        } else {
            parts.push(`${eighths}/8 in`);
        }
    }
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
       if (op1.category === UnitCategory.AREA && op2.category === UnitCategory.LENGTH) {
        return formatValue(resultValue, UnitCategory.VOLUME);
      }
       if (op1.category === UnitCategory.LENGTH && op2.category === UnitCategory.AREA) {
        return formatValue(resultValue, UnitCategory.VOLUME);
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
