// By removing the import of UNITS from constants.ts, we break a circular dependency
// that can cause module loaders in browsers to fail silently, resulting in a blank screen.

export type Operator = '+' | '-' | '*' | '/';

// We simplify UnitId to a string. Runtime validation in unitConverter.ts already ensures
// that only valid units are processed, so the app remains robust.
export type UnitId = string;

export interface Unit {
  name: string;
  symbol: string;
  category: string;
  to_base: number;
}
