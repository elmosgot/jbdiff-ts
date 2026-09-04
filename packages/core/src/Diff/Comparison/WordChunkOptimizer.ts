import type { CharSequenceInterface } from '../../Entity/Character/CharSequenceInterface.js';
import type { InlineChunk } from '../../Entity/Chunk/InlineChunk.js';
import { NewLineChunk } from '../../Entity/Chunk/NewLineChunk.js';
import { Range } from '../../Entity/Range.js';
import type { Side } from '../../Entity/Side.js';
import { Character } from '../../Util/Character.js';
import type { FairDiffIterableInterface } from './Iterables/interfaces.js';
import { AbstractChunkOptimizer } from './AbstractChunkOptimizer.js';

export class WordChunkOptimizer extends AbstractChunkOptimizer<InlineChunk> {
  constructor(
    words1: InlineChunk[],
    words2: InlineChunk[],
    private readonly text1: CharSequenceInterface,
    private readonly text2: CharSequenceInterface,
    changes: FairDiffIterableInterface,
  ) {
    super(words1, words2, changes);
  }

  protected getShift(
    touchSide: Side,
    equalForward: number,
    equalBackward: number,
    _range1: Range,
    range2: Range,
  ): number {
    const touchWords = touchSide.select(this.data1, this.data2);
    const touchText = touchSide.select(this.text1, this.text2);
    const touchStart = touchSide.select(range2.start1, range2.start2);

    if (WordChunkOptimizer.isSeparatedWithWhitespace(touchText, touchWords[touchStart - 1]!, touchWords[touchStart]!)) {
      return 0;
    }

    const leftShift = WordChunkOptimizer.findSequenceEdgeShift(
      touchText,
      touchWords,
      touchStart,
      equalForward,
      true,
    );
    if (leftShift > 0) {
      return leftShift;
    }

    const rightShift = WordChunkOptimizer.findSequenceEdgeShift(
      touchText,
      touchWords,
      touchStart - 1,
      equalBackward,
      false,
    );
    if (rightShift > 0) {
      return -rightShift;
    }

    return 0;
  }

  private static findSequenceEdgeShift(
    text: CharSequenceInterface,
    words: InlineChunk[],
    offset: number,
    count: number,
    leftToRight: boolean,
  ): number {
    for (let i = 0; i < count; i++) {
      const word1 = leftToRight ? words[offset + i]! : words[offset - i - 1]!;
      const word2 = leftToRight ? words[offset + i + 1]! : words[offset - i]!;

      if (WordChunkOptimizer.isSeparatedWithWhitespace(text, word1, word2)) {
        return i + 1;
      }
    }
    return -1;
  }

  private static isSeparatedWithWhitespace(
    text: CharSequenceInterface,
    word1: InlineChunk,
    word2: InlineChunk,
  ): boolean {
    if (word1 instanceof NewLineChunk || word2 instanceof NewLineChunk) {
      return true;
    }

    const chars = text.chars();
    const offset1 = word1.getOffset2();
    const offset2 = word2.getOffset1();

    for (let i = offset1; i < offset2; i++) {
      if (Character.IS_WHITESPACE[chars[i]!]) {
        return true;
      }
    }

    return false;
  }
}
