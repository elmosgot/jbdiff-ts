import type { Equatable } from '../EquatableInterface.js';
import type { CharSequenceInterface } from './CharSequenceInterface.js';

export class CharSequence implements CharSequenceInterface {
  private constructor(private readonly charArray: string[]) {}

  length(): number {
    return this.charArray.length;
  }

  charAt(index: number): string {
    return this.charArray[index]!;
  }

  chars(): string[] {
    return this.charArray;
  }

  isEmpty(): boolean {
    return this.charArray.length === 0;
  }

  subSequence(start: number, end: number): CharSequenceInterface {
    return new CharSequence(this.charArray.slice(start, end));
  }

  toString(): string {
    return this.charArray.join('');
  }

  static fromString(string: string): CharSequence {
    return new CharSequence([...string]);
  }

  equals(object: Equatable): boolean {
    if (!(object instanceof CharSequence)) {
      return false;
    }
    return object === this || this.charArray.every((c, i) => c === object.charArray[i]);
  }
}
