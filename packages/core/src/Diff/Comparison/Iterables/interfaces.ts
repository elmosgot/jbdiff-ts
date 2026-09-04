import type { Range } from '../../../Entity/Range.js';

export interface ChangeIterableInterface {
  valid(): boolean;
  next(): void;
  getStart1(): number;
  getStart2(): number;
  getEnd1(): number;
  getEnd2(): number;
}

export interface CursorIteratorInterface<T = Range> extends Iterable<T> {
  hasNext(): boolean;
  next(): T;
}

export interface DiffIterableInterface {
  getLength1(): number;
  getLength2(): number;
  changes(): CursorIteratorInterface;
  unchanged(): CursorIteratorInterface;
}

export type FairDiffIterableInterface = DiffIterableInterface;
