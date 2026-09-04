import { Range } from '../../../Entity/Range.js';
import type { ChangeIterableInterface, CursorIteratorInterface } from './interfaces.js';

export class UnchangedIterator implements CursorIteratorInterface {
  private lastIndex1 = 0;
  private lastIndex2 = 0;

  constructor(
    private readonly iterable: ChangeIterableInterface,
    private readonly length1: number,
    private readonly length2: number,
  ) {
    if (this.iterable.valid() && this.iterable.getStart1() === 0 && this.iterable.getStart2() === 0) {
      this.lastIndex1 = this.iterable.getEnd1();
      this.lastIndex2 = this.iterable.getEnd2();
      this.iterable.next();
    }
  }

  hasNext(): boolean {
    return this.iterable.valid() || this.lastIndex1 !== this.length1 || this.lastIndex2 !== this.length2;
  }

  next(): Range {
    if (this.iterable.valid()) {
      const chunk = new Range(
        this.lastIndex1,
        this.iterable.getStart1(),
        this.lastIndex2,
        this.iterable.getStart2(),
      );

      this.lastIndex1 = this.iterable.getEnd1();
      this.lastIndex2 = this.iterable.getEnd2();
      this.iterable.next();

      return chunk;
    }

    const chunk = new Range(this.lastIndex1, this.length1, this.lastIndex2, this.length2);
    this.lastIndex1 = this.length1;
    this.lastIndex2 = this.length2;
    return chunk;
  }

  *[Symbol.iterator](): Iterator<Range> {
    while (this.hasNext()) {
      yield this.next();
    }
  }
}
