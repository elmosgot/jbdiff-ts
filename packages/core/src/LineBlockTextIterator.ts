import type { LineBlock } from './Entity/LineFragmentSplitter/LineBlock.js';

export const TextPartType = {
  REMOVED: 1,
  UNCHANGED_BEFORE: 2,
  UNCHANGED_AFTER: 3,
  ADDED: 4,
} as const;

export type TextPartType = (typeof TextPartType)[keyof typeof TextPartType];
export type TextPart = [TextPartType, string];

export class LineBlockTextIterator implements Iterable<TextPart> {
  constructor(
    private readonly text1: string,
    private readonly text2: string,
    private readonly blocks: LineBlock[],
    private readonly splitOnNewlines = false,
  ) {}

  hasChanges(): boolean {
    let fragments = 0;
    for (const block of this.blocks) {
      fragments += block.fragments.length;
    }
    return fragments > 0;
  }

  *[Symbol.iterator](): Iterator<TextPart> {
    let previousEndOffset1 = 0;
    let previousEndOffset2 = 0;

    for (const block of this.blocks) {
      for (const fragment of block.fragments) {
        const startOffset1 = block.offsets.start1 + fragment.getStartOffset1();
        const endOffset1 = block.offsets.start1 + fragment.getEndOffset1();
        const startOffset2 = block.offsets.start2 + fragment.getStartOffset2();
        const endOffset2 = block.offsets.start2 + fragment.getEndOffset2();

        yield* this.yieldText(TextPartType.UNCHANGED_BEFORE, this.text1, previousEndOffset1, startOffset1);
        yield* this.yieldText(TextPartType.UNCHANGED_AFTER, this.text2, previousEndOffset2, startOffset2);
        yield* this.yieldText(TextPartType.REMOVED, this.text1, startOffset1, endOffset1);
        yield* this.yieldText(TextPartType.ADDED, this.text2, startOffset2, endOffset2);

        previousEndOffset1 = endOffset1;
        previousEndOffset2 = endOffset2;
      }
    }

    yield* this.yieldText(TextPartType.UNCHANGED_BEFORE, this.text1, previousEndOffset1, [...this.text1].length);
    yield* this.yieldText(TextPartType.UNCHANGED_AFTER, this.text2, previousEndOffset2, [...this.text2].length);
  }

  private *yieldText(type: TextPartType, text: string, start: number, end: number): Generator<TextPart> {
    const length = end - start;
    if (length === 0) {
      return;
    }

    const chars = [...text];
    const subText = chars.slice(start, end).join('');

    if (!this.splitOnNewlines) {
      yield [type, subText];
      return;
    }

    const pieces = subText.split('\n');
    for (let index = 0; index < pieces.length; index++) {
      if (index > 0) {
        yield [type, '\n'];
      }
      if (pieces[index] !== '') {
        yield [type, pieces[index]!];
      }
    }
  }
}
