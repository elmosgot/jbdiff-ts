import { Range } from '../../../Entity/Range.js';
import { AbstractChangeDiffIterable } from './AbstractChangeDiffIterable.js';
import type { ChangeIterableInterface } from './interfaces.js';
import { RangesChangeIterable } from './RangesChangeIterable.js';

export class RangesDiffIterable extends AbstractChangeDiffIterable {
  constructor(
    private readonly ranges: Range[],
    length1: number,
    length2: number,
  ) {
    super(length1, length2);
  }

  createChangeIterable(): ChangeIterableInterface {
    return new RangesChangeIterable(this.ranges);
  }
}
