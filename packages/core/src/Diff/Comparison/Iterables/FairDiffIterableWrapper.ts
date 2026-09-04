import type { DiffIterableInterface, FairDiffIterableInterface } from './interfaces.js';

export class FairDiffIterableWrapper implements FairDiffIterableInterface {
  constructor(private readonly iterable: DiffIterableInterface) {}

  getLength1(): number {
    return this.iterable.getLength1();
  }

  getLength2(): number {
    return this.iterable.getLength2();
  }

  changes() {
    return this.iterable.changes();
  }

  unchanged() {
    return this.iterable.unchanged();
  }
}
