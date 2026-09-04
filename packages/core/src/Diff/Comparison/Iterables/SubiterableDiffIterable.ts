import { AbstractChangeDiffIterable } from './AbstractChangeDiffIterable.js';
import type { ChangeIterableInterface, DiffIterableInterface } from './interfaces.js';
import { SubiterableChangeIterable } from './SubiterableChangeIterable.js';

export class SubiterableDiffIterable extends AbstractChangeDiffIterable {
  constructor(
    private readonly iterable: DiffIterableInterface,
    private readonly start1: number,
    private readonly end1: number,
    private readonly start2: number,
    private readonly end2: number,
  ) {
    super(end1 - start1, end2 - start2);
  }

  createChangeIterable(): ChangeIterableInterface {
    return new SubiterableChangeIterable(this.iterable, this.start1, this.end1, this.start2, this.end2);
  }
}
