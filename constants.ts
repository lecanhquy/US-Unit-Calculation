import { Unit } from './types.ts';

export enum UnitCategory {
  LENGTH = 'Length',
  AREA = 'Area',
  VOLUME = 'Volume',
  WEIGHT = 'Weight',
}

export const BASE_UNITS: { [key in UnitCategory]: string } = {
  [UnitCategory.LENGTH]: 'in',
  [UnitCategory.AREA]: 'in2',
  [UnitCategory.VOLUME]: 'fl-oz',
  [UnitCategory.WEIGHT]: 'oz',
};

export const UNITS: { [key: string]: Unit } = {
  // Length
  'in': { name: 'Inch', symbol: 'in', category: UnitCategory.LENGTH, to_base: 1 },
  'ft': { name: 'Foot', symbol: 'ft', category: UnitCategory.LENGTH, to_base: 12 },
  'yd': { name: 'Yard', symbol: 'yd', category: UnitCategory.LENGTH, to_base: 36 },
  'mi': { name: 'Mile', symbol: 'mi', category: UnitCategory.LENGTH, to_base: 63360 },
  
  // Area (Base unit: in²)
  'in2': { name: 'Square Inch', symbol: 'in²', category: UnitCategory.AREA, to_base: 1 },
  'ft2': { name: 'Square Foot', symbol: 'ft²', category: UnitCategory.AREA, to_base: 144 },
  'yd2': { name: 'Square Yard', symbol: 'yd²', category: UnitCategory.AREA, to_base: 1296 },
  'acre': { name: 'Acre', symbol: 'acre', category: UnitCategory.AREA, to_base: 6272640 },
  'mi2': { name: 'Square Mile', symbol: 'mi²', category: UnitCategory.AREA, to_base: 4014489600 },

  // Volume (Base unit: fl-oz)
  'fl-oz': { name: 'Fluid Ounce', symbol: 'fl oz', category: UnitCategory.VOLUME, to_base: 1 },
  'cup': { name: 'Cup', symbol: 'cup', category: UnitCategory.VOLUME, to_base: 8 },
  'pt': { name: 'Pint', symbol: 'pt', category: UnitCategory.VOLUME, to_base: 16 },
  'qt': { name: 'Quart', symbol: 'qt', category: UnitCategory.VOLUME, to_base: 32 },
  'gal': { name: 'Gallon', symbol: 'gal', category: UnitCategory.VOLUME, to_base: 128 },
  
  // Weight (Base unit: oz)
  'oz': { name: 'Ounce', symbol: 'oz', category: UnitCategory.WEIGHT, to_base: 1 },
  'lb': { name: 'Pound', symbol: 'lb', category: UnitCategory.WEIGHT, to_base: 16 },
  'ton': { name: 'Ton', symbol: 'ton', category: UnitCategory.WEIGHT, to_base: 32000 },
};