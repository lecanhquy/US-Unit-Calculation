
export type Operator = '+' | '-' | '*' | '/';

export type UnitId = string;

export interface Unit {
  name: string;
  symbol: string;
  category: string;
  to_base: number;
}
