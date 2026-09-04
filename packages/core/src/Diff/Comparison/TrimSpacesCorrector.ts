import type { CharSequenceInterface } from '../../Entity/Character/CharSequenceInterface.js';
import { Range } from '../../Entity/Range.js';
import { Character } from '../../Util/Character.js';
import { Strings } from '../../Util/Strings.js';
import { TrimUtil } from '../../Util/TrimUtil.js';
import { DiffIterableUtil } from '../DiffIterableUtil.js';
import type { DiffIterableInterface } from './Iterables/interfaces.js';

export class TrimSpacesCorrector {
  private readonly changes: Range[] = [];

  constructor(
    private readonly iterable: DiffIterableInterface,
    private readonly text1: CharSequenceInterface,
    private readonly text2: CharSequenceInterface,
  ) {}

  build(): DiffIterableInterface {
    for (const range of this.iterable.changes()) {
      let start1 = range.start1;
      let start2 = range.start2;
      let end1 = range.end1;
      let end2 = range.end2;

      if (Character.isLeadingTrailingSpace(this.text1, start1)) {
        start1 = TrimUtil.trimWhitespaceStart(this.text1, start1, end1);
      }
      if (Character.isLeadingTrailingSpace(this.text1, end1 - 1)) {
        end1 = TrimUtil.trimWhitespaceEnd(this.text1, start1, end1);
      }
      if (Character.isLeadingTrailingSpace(this.text2, start2)) {
        start2 = TrimUtil.trimWhitespaceStart(this.text2, start2, end2);
      }
      if (Character.isLeadingTrailingSpace(this.text2, end2 - 1)) {
        end2 = TrimUtil.trimWhitespaceEnd(this.text2, start2, end2);
      }

      const trimmed = new Range(start1, end1, start2, end2);
      if (trimmed.isEmpty()) {
        continue;
      }
      if (Strings.equalsCaseSensitive(this.text1, this.text2, trimmed.start1, trimmed.end1, trimmed.start2, trimmed.end2)) {
        continue;
      }

      this.changes.push(trimmed);
    }

    return DiffIterableUtil.createFromRanges(this.changes, this.text1.length(), this.text2.length());
  }
}
