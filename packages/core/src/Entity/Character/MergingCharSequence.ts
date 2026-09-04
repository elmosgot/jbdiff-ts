import type { Equatable } from '../EquatableInterface.js';
import type { CharSequenceInterface } from './CharSequenceInterface.js';

export class MergingCharSequence implements CharSequenceInterface {
  constructor(
    private readonly s1: CharSequenceInterface,
    private readonly s2: CharSequenceInterface,
  ) {}

  length(): number {
    return this.s1.length() + this.s2.length();
  }

  isEmpty(): boolean {
    return this.s1.isEmpty() && this.s2.isEmpty();
  }

  charAt(index: number): string {
    if (index < this.s1.length()) {
      return this.s1.charAt(index);
    }
    return this.s2.charAt(index - this.s1.length());
  }

  chars(): string[] {
    return [...this.s1.chars(), ...this.s2.chars()];
  }

  subSequence(start: number, end: number): CharSequenceInterface {
    if (start === 0 && end === this.length()) {
      return this;
    }

    const firstLength = this.s1.length();

    if (start < firstLength && end < firstLength) {
      return this.s1.subSequence(start, end);
    }

    if (start >= firstLength && end >= firstLength) {
      return this.s2.subSequence(start - firstLength, end - firstLength);
    }

    return new MergingCharSequence(
      this.s1.subSequence(start, firstLength),
      this.s2.subSequence(0, end - firstLength),
    );
  }

  equals(object: Equatable): boolean {
    return (
      typeof (object as CharSequenceInterface).length === 'function' &&
      this.toString() === object.toString()
    );
  }

  toString(): string {
    return this.s1.toString() + this.s2.toString();
  }
}
