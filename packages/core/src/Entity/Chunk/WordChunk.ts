import type { CharSequenceInterface } from '../Character/CharSequenceInterface.js';
import type { Equatable } from '../EquatableInterface.js';
import type { InlineChunk } from './InlineChunk.js';

export class WordChunk implements InlineChunk {
  private readonly subtext: string;

  constructor(
    private readonly text: CharSequenceInterface,
    private readonly offset1: number,
    private readonly offset2: number,
  ) {
    this.subtext = this.text.subSequence(this.offset1, this.offset2).toString();
  }

  getContent(): string {
    return this.subtext;
  }

  getOffset1(): number {
    return this.offset1;
  }

  getOffset2(): number {
    return this.offset2;
  }

  equals(object: Equatable): boolean {
    if (!(object instanceof WordChunk)) {
      return false;
    }
    if (object === this) {
      return true;
    }
    return this.subtext === object.subtext;
  }
}
