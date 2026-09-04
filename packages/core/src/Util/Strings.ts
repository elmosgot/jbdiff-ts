import type { CharSequenceInterface } from '../Entity/Character/CharSequenceInterface.js';
import { Character } from './Character.js';

export class Strings {
  static equalsCaseSensitive(
    text1: CharSequenceInterface | null,
    text2: CharSequenceInterface | null,
    start1?: number,
    end1?: number,
    start2?: number,
    end2?: number,
  ): boolean {
    if (text1 === text2) {
      return true;
    }
    if (text1 == null || text2 == null) {
      return false;
    }

    const chars1 = text1.chars();
    const chars2 = text2.chars();

    let s1 = start1 ?? 0;
    let s2 = start2 ?? 0;
    const e1 = end1 ?? chars1.length;
    const e2 = end2 ?? chars2.length;

    if (e1 - s1 !== e2 - s2) {
      return false;
    }

    for (; s1 < e1 && s2 < e2; s1++, s2++) {
      if (chars1[s1] !== chars2[s2]) {
        return false;
      }
    }

    return true;
  }

  static equalsIgnoreWhitespaces(
    text1: CharSequenceInterface | null,
    text2: CharSequenceInterface | null,
    start1?: number,
    end1?: number,
    start2?: number,
    end2?: number,
  ): boolean {
    if (text1 == null && text2 == null) {
      return true;
    }
    if (text1 == null || text2 == null) {
      return false;
    }

    const chars1 = text1.chars();
    const chars2 = text2.chars();

    const len1 = end1 ?? chars1.length;
    const len2 = end2 ?? chars2.length;

    let index1 = start1 ?? 0;
    let index2 = start2 ?? 0;

    while (index1 < len1 && index2 < len2) {
      if (chars1[index1] === chars2[index2]) {
        index1++;
        index2++;
        continue;
      }

      let skipped = false;
      while (index1 !== len1 && Character.IS_WHITESPACE[chars1[index1]!]) {
        skipped = true;
        index1++;
      }
      while (index2 !== len2 && Character.IS_WHITESPACE[chars2[index2]!]) {
        skipped = true;
        index2++;
      }

      if (!skipped) {
        return false;
      }
    }

    for (; index1 !== len1; index1++) {
      if (!Character.IS_WHITESPACE[chars1[index1]!]) {
        return false;
      }
    }
    for (; index2 !== len2; index2++) {
      if (!Character.IS_WHITESPACE[chars2[index2]!]) {
        return false;
      }
    }

    return true;
  }

  static equalsTrimWhitespaces(
    text1: CharSequenceInterface,
    text2: CharSequenceInterface,
    start1?: number,
    end1?: number,
    start2?: number,
    end2?: number,
  ): boolean {
    const chars1 = text1.chars();
    const chars2 = text2.chars();

    let s1 = start1 ?? 0;
    let s2 = start2 ?? 0;
    let e1 = end1 ?? chars1.length;
    let e2 = end2 ?? chars2.length;

    while (s1 < e1) {
      if (!Character.IS_WHITESPACE[chars1[s1]!]) {
        break;
      }
      s1++;
    }

    while (s1 < e1) {
      if (!Character.IS_WHITESPACE[chars1[e1 - 1]!]) {
        break;
      }
      e1--;
    }

    while (s2 < e2) {
      if (!Character.IS_WHITESPACE[chars2[s2]!]) {
        break;
      }
      s2++;
    }

    while (s2 < e2) {
      if (!Character.IS_WHITESPACE[chars2[e2 - 1]!]) {
        break;
      }
      e2--;
    }

    return Strings.equalsCaseSensitive(text1, text2, s1, e1, s2, e2);
  }
}
