import { Range } from '../../../Entity/Range.js';
import type { ChangeIterableInterface, CursorIteratorInterface } from './interfaces.js';

export class ChangedIterator implements CursorIteratorInterface {
  constructor(private readonly iterable: ChangeIterableInterface) {}

  hasNext(): boolean {
    return this.iterable.valid();
  }

  next(): Range {
    const range = new Range(
      this.iterable.getStart1(),
      this.iterable.getEnd1(),
      this.iterable.getStart2(),
      this.iterable.getEnd2(),
    );
    this.iterable.next();
    return range;
  }

  *[Symbol.iterator](): Iterator<Range> {
    while (this.hasNext()) {
      yield this.next();
    }
  }
}
