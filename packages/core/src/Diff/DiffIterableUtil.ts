import type { Change } from '../Entity/Change/Change.js';
import type { CharSequenceInterface } from '../Entity/Character/CharSequenceInterface.js';
import type { InlineChunk } from '../Entity/Chunk/InlineChunk.js';
import type { Equatable } from '../Entity/EquatableInterface.js';
import { Range } from '../Entity/Range.js';
import { Diff } from './Util/Diff.js';
import { AdjustmentPunctuationMatcher } from './AdjustmentPunctuationMatcher/AdjustmentPunctuationMatcher.js';
import { DiffChangeDiffIterable } from './Comparison/Iterables/DiffChangeDiffIterable.js';
import { FairDiffIterableWrapper } from './Comparison/Iterables/FairDiffIterableWrapper.js';
import { InvertedDiffIterableWrapper } from './Comparison/Iterables/InvertedDiffIterableWrapper.js';
import { RangesDiffIterable } from './Comparison/Iterables/RangesDiffIterable.js';
import type { DiffIterableInterface, FairDiffIterableInterface } from './Comparison/Iterables/interfaces.js';

export class DiffIterableUtil {
  static diff(objects1: Array<number | Equatable>, objects2: Array<number | Equatable>): FairDiffIterableInterface {
    const change = new Diff().buildChanges(objects1, objects2);
    return DiffIterableUtil.fair(DiffIterableUtil.create(change, objects1.length, objects2.length));
  }

  static create(change: Change | null, length1: number, length2: number): DiffIterableInterface {
    return new DiffChangeDiffIterable(change, length1, length2);
  }

  static createFromRanges(ranges: Range[], length1: number, length2: number): DiffIterableInterface {
    return new RangesDiffIterable(ranges, length1, length2);
  }

  static createUnchanged(ranges: Range[], length1: number, length2: number): DiffIterableInterface {
    return new InvertedDiffIterableWrapper(new RangesDiffIterable(ranges, length1, length2));
  }

  static fair(iterable: DiffIterableInterface): FairDiffIterableInterface {
    if ('changes' in iterable && 'unchanged' in iterable) {
      return iterable as FairDiffIterableInterface;
    }
    return new FairDiffIterableWrapper(iterable);
  }

  static matchAdjustmentDelimiters(
    text1: CharSequenceInterface,
    text2: CharSequenceInterface,
    words1: InlineChunk[],
    words2: InlineChunk[],
    changes: FairDiffIterableInterface,
    startShift1: number,
    startShift2: number,
  ): FairDiffIterableInterface {
    return new AdjustmentPunctuationMatcher(
      text1,
      text2,
      words1,
      words2,
      startShift1,
      startShift2,
      changes,
    ).build();
  }
}
