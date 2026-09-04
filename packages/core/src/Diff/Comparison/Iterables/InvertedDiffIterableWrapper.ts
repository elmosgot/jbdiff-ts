import type { DiffIterableInterface } from './interfaces.js';

export class InvertedDiffIterableWrapper implements DiffIterableInterface {
  constructor(private readonly iterable: DiffIterableInterface) {}

  getLength1(): number {
    return this.iterable.getLength1();
  }

  getLength2(): number {
    return this.iterable.getLength2();
  }

  changes() {
    return this.iterable.unchanged();
  }

  unchanged() {
    return this.iterable.changes();
  }
}
