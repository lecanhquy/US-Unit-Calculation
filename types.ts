import { UNITS } from './constants.ts';

export type Operator = '+' | '-' | '*' | '/';

export type UnitId = keyof typeof UNITS;

export interface Unit {
  name: string;
  symbol: string;
  category: string;
  to_base: number;
}