import type { Equatable } from '../EquatableInterface.js';

export interface InlineChunk extends Equatable {
  getOffset1(): number;
  getOffset2(): number;
}
