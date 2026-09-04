import type { Equatable } from '../EquatableInterface.js';
import type { InlineChunk } from './InlineChunk.js';

export class NewLineChunk implements InlineChunk {
  constructor(private readonly offset: number) {}

  getOffset1(): number {
    return this.offset;
  }

  getOffset2(): number {
    return this.offset + 1;
  }

  equals(object: Equatable): boolean {
    return object instanceof NewLineChunk;
  }
}
