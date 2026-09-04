import { Range } from '../../Entity/Range.js';
import { Side } from '../../Entity/Side.js';
import { TrimUtil } from '../../Util/TrimUtil.js';
import { DiffIterableUtil } from '../DiffIterableUtil.js';
import type { FairDiffIterableInterface } from './Iterables/interfaces.js';

export abstract class AbstractChunkOptimizer<T> {
  private readonly ranges: Range[] = [];

  constructor(
    protected readonly data1: T[],
    protected readonly data2: T[],
    private readonly iterable: FairDiffIterableInterface,
  ) {}

  build(): FairDiffIterableInterface {
    for (const range of this.iterable.unchanged()) {
      this.ranges.push(range);
      this.processLastRanges();
    }

    return DiffIterableUtil.fair(
      DiffIterableUtil.createUnchanged(this.ranges, this.data1.length, this.data2.length),
    );
  }

  private processLastRanges(): void {
    if (this.ranges.length < 2) {
      return;
    }

    const range1 = this.ranges[this.ranges.length - 2]!;
    const range2 = this.ranges[this.ranges.length - 1]!;
    if (range1.end1 !== range2.start1 && range1.end2 !== range2.start2) {
      return;
    }

    const count1 = range1.end1 - range1.start1;
    const count2 = range2.end1 - range2.start1;

    const equalForward = TrimUtil.expandForward(
      this.data1,
      this.data2,
      range1.end1,
      range1.end2,
      range1.end1 + count2,
      range1.end2 + count2,
    );
    const equalBackward = TrimUtil.expandBackward(
      this.data1,
      this.data2,
      range2.start1 - count1,
      range2.start2 - count1,
      range2.start1,
      range2.start2,
    );

    if (equalForward === 0 && equalBackward === 0) {
      return;
    }

    if (equalForward === count2) {
      this.ranges.pop();
      this.ranges.pop();
      this.ranges.push(
        new Range(range1.start1, range1.end1 + count2, range1.start2, range1.end2 + count2),
      );
      this.processLastRanges();
      return;
    }

    if (equalForward === count1) {
      this.ranges.pop();
      this.ranges.pop();
      this.ranges.push(
        new Range(range2.start1 - count1, range2.end1, range2.start2 - count1, range2.end2),
      );
      this.processLastRanges();
      return;
    }

    const touchSide = Side.fromLeft(range1.end1 === range2.start1);
    const shift = this.getShift(touchSide, equalForward, equalBackward, range1, range2);
    if (shift !== 0) {
      this.ranges.pop();
      this.ranges.pop();
      this.ranges.push(new Range(range1.start1, range1.end1 + shift, range1.start2, range1.end2 + shift));
      this.ranges.push(new Range(range2.start1 + shift, range2.end1, range2.start2 + shift, range2.end2));
    }
  }

  protected abstract getShift(
    touchSide: Side,
    equalForward: number,
    equalBackward: number,
    range1: Range,
    range2: Range,
  ): number;
}
