import type { CharSequenceInterface } from '../../Entity/Character/CharSequenceInterface.js';
import { Range } from '../../Entity/Range.js';
import { TrimUtil } from '../../Util/TrimUtil.js';
import { DiffIterableUtil } from '../DiffIterableUtil.js';
import type { DiffIterableInterface } from './Iterables/interfaces.js';

export class IgnoreSpacesCorrector {
  private readonly changes: Range[] = [];

  constructor(
    private readonly iterable: DiffIterableInterface,
    private readonly text1: CharSequenceInterface,
    private readonly text2: CharSequenceInterface,
  ) {}

  build(): DiffIterableInterface {
    for (const range of this.iterable.changes()) {
      const expanded = TrimUtil.expandWhitespaces(this.text1, this.text2, range);
      const trimmed = TrimUtil.trimWhitespacesRange(this.text1, this.text2, expanded);

      if (trimmed.isEmpty() || TrimUtil.isEqualsIgnoreWhitespacesRange(this.text1, this.text2, trimmed)) {
        continue;
      }

      this.changes.push(trimmed);
    }

    return DiffIterableUtil.createFromRanges(this.changes, this.text1.length(), this.text2.length());
  }
}
