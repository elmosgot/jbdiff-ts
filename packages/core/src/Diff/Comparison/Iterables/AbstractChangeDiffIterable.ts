import type { ChangeIterableInterface, CursorIteratorInterface } from './interfaces.js';
import { ChangedIterator } from './ChangedIterator.js';
import { UnchangedIterator } from './UnchangedIterator.js';

export abstract class AbstractChangeDiffIterable {
  constructor(
    private readonly length1: number,
    private readonly length2: number,
  ) {}

  getLength1(): number {
    return this.length1;
  }

  getLength2(): number {
    return this.length2;
  }

  changes(): CursorIteratorInterface {
    return new ChangedIterator(this.createChangeIterable());
  }

  unchanged(): CursorIteratorInterface {
    return new UnchangedIterator(this.createChangeIterable(), this.length1, this.length2);
  }

  abstract createChangeIterable(): ChangeIterableInterface;
}
