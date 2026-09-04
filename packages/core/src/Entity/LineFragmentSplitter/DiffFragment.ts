import type { DiffFragmentInterface } from './DiffFragmentInterface.js';

export class DiffFragment implements DiffFragmentInterface {
  constructor(
    private readonly startOffset1: number,
    private readonly endOffset1: number,
    private readonly startOffset2: number,
    private readonly endOffset2: number,
  ) {
    if (startOffset1 === endOffset1 && startOffset2 === endOffset2) {
      throw new Error('DiffFragment cannot be empty');
    }
    if (startOffset1 > endOffset1 || startOffset2 > endOffset2) {
      throw new Error('Invalid DiffFragment offsets');
    }
  }

  getStartOffset1(): number {
    return this.startOffset1;
  }

  getEndOffset1(): number {
    return this.endOffset1;
  }

  getStartOffset2(): number {
    return this.startOffset2;
  }

  getEndOffset2(): number {
    return this.endOffset2;
  }

  toString(): string {
    return `[${this.startOffset1}, ${this.endOffset1}] - [${this.startOffset2}, ${this.endOffset2}]`;
  }
}
