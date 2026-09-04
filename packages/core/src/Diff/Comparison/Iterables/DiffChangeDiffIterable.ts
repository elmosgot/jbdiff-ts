import type { Change } from '../../../Entity/Change/Change.js';
import { AbstractChangeDiffIterable } from './AbstractChangeDiffIterable.js';
import type { ChangeIterableInterface } from './interfaces.js';
import { DiffChangeChangeIterable } from './DiffChangeChangeIterable.js';

export class DiffChangeDiffIterable extends AbstractChangeDiffIterable {
  constructor(
    private readonly change: Change | null,
    length1: number,
    length2: number,
  ) {
    super(length1, length2);
  }

  createChangeIterable(): ChangeIterableInterface {
    return new DiffChangeChangeIterable(this.change);
  }
}
