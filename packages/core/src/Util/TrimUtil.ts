import type { CharSequenceInterface } from '../Entity/Character/CharSequenceInterface.js';
import { Range } from '../Entity/Range.js';
import { Character } from './Character.js';
import { Strings } from './Strings.js';

export class TrimUtil {
  static expandForward<T>(data1: T[], data2: T[], start1: number, start2: number, end1: number, end2: number): number {
    return TrimUtil.expandForwardCallback(start1, start2, end1, end2, (i1, i2) => data1[i1] === data2[i2]);
  }

  static expandBackward<T>(data1: T[], data2: T[], start1: number, start2: number, end1: number, end2: number): number {
    return TrimUtil.expandBackwardCallback(start1, start2, end1, end2, (i1, i2) => data1[i1] === data2[i2]);
  }

  static expandWhitespaces(text1: CharSequenceInterface, text2: CharSequenceInterface, range: Range): Range {
    const chars1 = text1.chars();
    const chars2 = text2.chars();

    return TrimUtil.expandIgnored(
      range.start1,
      range.start2,
      range.end1,
      range.end2,
      (i1, i2) => chars1[i1] === chars2[i2],
      (i) => Character.isWhiteSpace(chars1[i]!),
    );
  }

  static expandWhitespacesForward(
    text1: CharSequenceInterface,
    text2: CharSequenceInterface,
    start1: number,
    start2: number,
    end1: number,
    end2: number,
  ): number {
    const chars1 = text1.chars();
    const chars2 = text2.chars();

    return TrimUtil.expandIgnoredForward(
      start1,
      start2,
      end1,
      end2,
      (i1, i2) => chars1[i1] === chars2[i2],
      (i) => Character.isWhiteSpace(chars1[i]!),
    );
  }

  static expandWhitespacesBackward(
    text1: CharSequenceInterface,
    text2: CharSequenceInterface,
    start1: number,
    start2: number,
    end1: number,
    end2: number,
  ): number {
    const chars1 = text1.chars();
    const chars2 = text2.chars();

    return TrimUtil.expandIgnoredBackward(
      start1,
      start2,
      end1,
      end2,
      (i1, i2) => chars1[i1] === chars2[i2],
      (i) => Character.isWhiteSpace(chars1[i]!),
    );
  }

  static trimWhitespacesRange(text1: CharSequenceInterface, text2: CharSequenceInterface, range: Range): Range {
    const chars1 = text1.chars();
    const chars2 = text2.chars();

    return TrimUtil.trimRangeCallback(
      range.start1,
      range.start2,
      range.end1,
      range.end2,
      (i) => Character.isWhiteSpace(chars1[i]!),
      (i) => Character.isWhiteSpace(chars2[i]!),
    );
  }

  static trimWhitespaceStart(text: CharSequenceInterface, start: number, end: number): number {
    const chars = text.chars();
    return TrimUtil.trimStartCallback(start, end, (i) => Character.isWhiteSpace(chars[i]!));
  }

  static trimWhitespaceEnd(text: CharSequenceInterface, start: number, end: number): number {
    const chars = text.chars();
    return TrimUtil.trimEndCallback(start, end, (i) => Character.isWhiteSpace(chars[i]!));
  }

  static isEqualsIgnoreWhitespacesRange(text1: CharSequenceInterface, text2: CharSequenceInterface, range: Range): boolean {
    return Strings.equalsIgnoreWhitespaces(text1, text2, range.start1, range.end1, range.start2, range.end2);
  }

  private static expandForwardCallback(
    start1: number,
    start2: number,
    end1: number,
    end2: number,
    equals: (i1: number, i2: number) => boolean,
  ): number {
    const oldStart1 = start1;
    while (start1 < end1 && start2 < end2) {
      if (!equals(start1, start2)) {
        break;
      }
      start1++;
      start2++;
    }
    return start1 - oldStart1;
  }

  private static expandBackwardCallback(
    start1: number,
    start2: number,
    end1: number,
    end2: number,
    equals: (i1: number, i2: number) => boolean,
  ): number {
    const oldEnd1 = end1;
    while (start1 < end1 && start2 < end2) {
      if (!equals(end1 - 1, end2 - 1)) {
        break;
      }
      end1--;
      end2--;
    }
    return oldEnd1 - end1;
  }

  private static expandIgnored(
    start1: number,
    start2: number,
    end1: number,
    end2: number,
    equals: (i1: number, i2: number) => boolean,
    ignored1: (i: number) => boolean,
  ): Range {
    const count1 = TrimUtil.expandIgnoredForward(start1, start2, end1, end2, equals, ignored1);
    start1 += count1;
    start2 += count1;

    const count2 = TrimUtil.expandIgnoredBackward(start1, start2, end1, end2, equals, ignored1);
    end1 -= count2;
    end2 -= count2;

    return new Range(start1, end1, start2, end2);
  }

  private static expandIgnoredForward(
    start1: number,
    start2: number,
    end1: number,
    end2: number,
    equals: (i1: number, i2: number) => boolean,
    ignored1: (i: number) => boolean,
  ): number {
    const oldStart1 = start1;
    while (start1 < end1 && start2 < end2) {
      if (!equals(start1, start2)) {
        break;
      }
      if (!ignored1(start1)) {
        break;
      }
      start1++;
      start2++;
    }
    return start1 - oldStart1;
  }

  private static expandIgnoredBackward(
    start1: number,
    start2: number,
    end1: number,
    end2: number,
    equals: (i1: number, i2: number) => boolean,
    ignored1: (i: number) => boolean,
  ): number {
    const oldEnd1 = end1;
    while (start1 < end1 && start2 < end2) {
      if (!equals(end1 - 1, end2 - 1)) {
        break;
      }
      if (!ignored1(end1 - 1)) {
        break;
      }
      end1--;
      end2--;
    }
    return oldEnd1 - end1;
  }

  private static trimRangeCallback(
    start1: number,
    start2: number,
    end1: number,
    end2: number,
    ignored1: (i: number) => boolean,
    ignored2: (i: number) => boolean,
  ): Range {
    start1 = TrimUtil.trimStartCallback(start1, end1, ignored1);
    end1 = TrimUtil.trimEndCallback(start1, end1, ignored1);

    start2 = TrimUtil.trimStartCallback(start2, end2, ignored2);
    end2 = TrimUtil.trimEndCallback(start2, end2, ignored2);

    return new Range(start1, end1, start2, end2);
  }

  private static trimStartCallback(start: number, end: number, ignored: (i: number) => boolean): number {
    while (start < end) {
      if (!ignored(start)) {
        break;
      }
      start++;
    }
    return start;
  }

  private static trimEndCallback(start: number, end: number, ignored: (i: number) => boolean): number {
    while (start < end) {
      if (!ignored(end - 1)) {
        break;
      }
      end--;
    }
    return end;
  }
}
