import { Range } from '../../../Entity/Range.js';
import type { ChangeIterableInterface } from './interfaces.js';

export class RangesChangeIterable implements ChangeIterableInterface {
  private current = 0;
  private last: Range | null;

  constructor(private readonly ranges: Range[]) {
    this.last = this.ranges[this.current] ?? null;
  }

  valid(): boolean {
    return this.last !== null;
  }

  next(): void {
    this.current++;
    this.last = this.ranges[this.current] ?? null;
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
