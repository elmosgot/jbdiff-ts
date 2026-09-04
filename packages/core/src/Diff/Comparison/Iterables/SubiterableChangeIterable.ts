import { Range } from '../../../Entity/Range.js';
import type { ChangeIterableInterface, DiffIterableInterface } from './interfaces.js';

export class SubiterableChangeIterable implements ChangeIterableInterface {
  private readonly iterator: Iterable<Range>;
  private last: Range | null = null;

  constructor(
    iterable: DiffIterableInterface,
    private readonly start1: number,
    private readonly end1: number,
    private readonly start2: number,
    private readonly end2: number,
  ) {
    this.iterator = iterable.changes();
    this.next();
  }

  valid(): boolean {
    return this.last !== null;
  }

  next(): void {
    this.last = null;
    for (const range of this.iterator) {
      if (range.end1 < this.start1 || range.end2 < this.start2) {
        continue;
      }
      if (range.start1 > this.end1 || range.start2 > this.end2) {
        break;
      }

      const newRange = new Range(
        Math.max(this.start1, range.start1) - this.start1,
        Math.min(this.end1, range.end1) - this.start1,
        Math.max(this.start2, range.start2) - this.start2,
        Math.min(this.end2, range.end2) - this.start2,
      );
      if (newRange.isEmpty()) {
        continue;
      }
      this.last = newRange;
      break;
    }
  }

  getStart1(): number {
    return this.last!.start1;
  }

  getStart2(): number {
    return this.last!.start2;
  }

  getEnd1(): number {
    return this.last!.end1;
  }

  getEnd2(): number {
    return this.last!.end2;
  }
}
