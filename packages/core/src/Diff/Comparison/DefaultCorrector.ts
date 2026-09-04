import type { CharSequenceInterface } from '../../Entity/Character/CharSequenceInterface.js';
import { Range } from '../../Entity/Range.js';
import { TrimUtil } from '../../Util/TrimUtil.js';
import { DiffIterableUtil } from '../DiffIterableUtil.js';
import type { DiffIterableInterface } from './Iterables/interfaces.js';

export class DefaultCorrector {
  private readonly changes: Range[] = [];

  constructor(
    private readonly iterable: DiffIterableInterface,
    private readonly text1: CharSequenceInterface,
    private readonly text2: CharSequenceInterface,
  ) {}

  build(): DiffIterableInterface {
    for (const range of this.iterable.changes()) {
      const endCut = TrimUtil.expandWhitespacesBackward(
        this.text1,
        this.text2,
        range.start1,
        range.start2,
        range.end1,
        range.end2,
      );
      const startCut = TrimUtil.expandWhitespacesForward(
        this.text1,
        this.text2,
        range.start1,
        range.start2,
        range.end1 - endCut,
        range.end2 - endCut,
      );

      const expand = new Range(
        range.start1 + startCut,
        range.end1 - endCut,
        range.start2 + startCut,
        range.end2 - endCut,
      );
      if (!expand.isEmpty()) {
        this.changes.push(expand);
      }
    }

    return DiffIterableUtil.createFromRanges(this.changes, this.text1.length(), this.text2.length());
  }
}
