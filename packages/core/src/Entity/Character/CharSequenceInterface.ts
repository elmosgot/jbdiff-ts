import type { Equatable } from '../EquatableInterface.js';

export interface CharSequenceInterface {
  length(): number;
  charAt(index: number): string;
  chars(): string[];
  isEmpty(): boolean;
  subSequence(start: number, end: number): CharSequenceInterface;
  equals(object: Equatable): boolean;
  toString(): string;
}
