import type { CharSequenceInterface } from '../Entity/Character/CharSequenceInterface.js';
import { CodePointsOffsets } from '../Entity/Character/CodePointsOffsets.js';
import { Character } from '../Util/Character.js';
import { ChangeBuilder } from './AdjustmentPunctuationMatcher/ChangeBuilder.js';
import { DiffIterableUtil } from './DiffIterableUtil.js';
import type { FairDiffIterableInterface } from './Comparison/Iterables/interfaces.js';

export class ByCharRt {
  static comparePunctuation(text1: CharSequenceInterface, text2: CharSequenceInterface): FairDiffIterableInterface {
    const chars1 = ByCharRt.getPunctuationChars(text1);
    const chars2 = ByCharRt.getPunctuationChars(text2);

    const nonSpaceChanges = DiffIterableUtil.diff(chars1.codePoints, chars2.codePoints);
    return ByCharRt.transferPunctuation(chars1, chars2, text1, text2, nonSpaceChanges);
  }

  static getPunctuationChars(text: CharSequenceInterface): CodePointsOffsets {
    const codePoints: number[] = [];
    const offsets: number[] = [];

    text.chars().forEach((char, i) => {
      const codePoint = char.codePointAt(0)!;
      if (Character.IS_PUNCTUATION_CODE_POINT[codePoint]) {
        codePoints.push(codePoint);
        offsets.push(i);
      }
    });

    return new CodePointsOffsets(codePoints, offsets);
  }

  private static transferPunctuation(
    chars1: CodePointsOffsets,
    chars2: CodePointsOffsets,
    text1: CharSequenceInterface,
    text2: CharSequenceInterface,
    changes: FairDiffIterableInterface,
  ): FairDiffIterableInterface {
    const builder = new ChangeBuilder(text1.length(), text2.length());

    for (const range of changes.unchanged()) {
      const count = range.end1 - range.start1;
      for (let i = 0; i < count; i++) {
        const offset1 = chars1.offsets[range.start1 + i]!;
        const offset2 = chars2.offsets[range.start2 + i]!;
        builder.markEqualCount(offset1, offset2);
      }
    }

    return DiffIterableUtil.fair(builder.finish());
  }
}
