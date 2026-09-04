import type { CharSequenceInterface } from '../Entity/Character/CharSequenceInterface.js';
import { NON_CONTINUOUS_SCRIPT_CODE_POINTS } from '../resources/nonContinuousScriptLookupTable.js';

export class Character {
  static readonly MIN_SUPPLEMENTARY_CODE_POINT = 0x010000;
  static readonly IS_WHITESPACE: Record<string, boolean> = { '\n': true, '\t': true, ' ': true };
  static readonly IS_PUNCTUATION_CODE_POINT: Record<number, boolean> = {
    33: true, 34: true, 35: true, 36: true, 37: true, 38: true, 39: true, 40: true, 41: true,
    42: true, 43: true, 44: true, 45: true, 46: true, 47: true, 58: true, 59: true, 60: true,
    61: true, 62: true, 63: true, 64: true, 91: true, 92: true, 93: true, 94: true, 96: true,
    123: true, 124: true, 125: true, 126: true,
  };
  private static readonly IS_WHITESPACE_CODE_POINT: Record<number, boolean> = { 9: true, 10: true, 32: true };

  static charCount(codePoint: number): number {
    return codePoint >= Character.MIN_SUPPLEMENTARY_CODE_POINT ? 2 : 1;
  }

  static isAlpha(codePoint: number): boolean {
    return !Character.IS_WHITESPACE_CODE_POINT[codePoint] && !Character.IS_PUNCTUATION_CODE_POINT[codePoint];
  }

  static isContinuousScript(codePoint: number): boolean {
    if (codePoint < 128 || /\p{Nd}/u.test(String.fromCodePoint(codePoint))) {
      return false;
    }
    return !NON_CONTINUOUS_SCRIPT_CODE_POINTS.has(codePoint);
  }

  static isWhiteSpace(char: string): boolean {
    return Character.IS_WHITESPACE[char] ?? false;
  }

  static isLeadingTrailingSpace(text: CharSequenceInterface, start: number): boolean {
    return Character.isLeadingSpace(text, start) || Character.isTrailingSpace(text, start);
  }

  static isLeadingSpace(text: CharSequenceInterface, start: number): boolean {
    const chars = text.chars();
    if (start < 0 || start >= chars.length || !Character.isWhiteSpace(chars[start]!)) {
      return false;
    }

    let index = start - 1;
    while (index >= 0) {
      const char = chars[index]!;
      if (char === '\n') {
        return true;
      }
      if (!Character.isWhiteSpace(char)) {
        return false;
      }
      index--;
    }

    return true;
  }

  static isTrailingSpace(text: CharSequenceInterface, end: number): boolean {
    const chars = text.chars();
    const len = chars.length;
    if (end < 0 || end >= len || !Character.isWhiteSpace(chars[end]!)) {
      return false;
    }

    while (end < len) {
      const char = chars[end]!;
      if (char === '\n') {
        return true;
      }
      if (!Character.isWhiteSpace(char)) {
        return false;
      }
      end++;
    }

    return true;
  }
}
