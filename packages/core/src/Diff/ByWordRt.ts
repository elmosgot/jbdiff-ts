import { ComparisonPolicy } from '../ComparisonPolicy.js';
import type { CharSequenceInterface } from '../Entity/Character/CharSequenceInterface.js';
import { MergingCharSequence } from '../Entity/Character/MergingCharSequence.js';
import type { InlineChunk } from '../Entity/Chunk/InlineChunk.js';
import { NewLineChunk } from '../Entity/Chunk/NewLineChunk.js';
import { WordChunk } from '../Entity/Chunk/WordChunk.js';
import { DiffFragment } from '../Entity/LineFragmentSplitter/DiffFragment.js';
import type { DiffFragmentInterface } from '../Entity/LineFragmentSplitter/DiffFragmentInterface.js';
import { LineBlock } from '../Entity/LineFragmentSplitter/LineBlock.js';
import { Range } from '../Entity/Range.js';
import { Character } from '../Util/Character.js';
import { ByCharRt } from './ByCharRt.js';
import { DefaultCorrector } from './Comparison/DefaultCorrector.js';
import { IgnoreSpacesCorrector } from './Comparison/IgnoreSpacesCorrector.js';
import { LineFragmentSplitter } from './Comparison/LineFragmentSplitter.js';
import { TrimSpacesCorrector } from './Comparison/TrimSpacesCorrector.js';
import { WordChunkOptimizer } from './Comparison/WordChunkOptimizer.js';
import type { DiffIterableInterface, FairDiffIterableInterface } from './Comparison/Iterables/interfaces.js';
import { SubiterableDiffIterable } from './Comparison/Iterables/SubiterableDiffIterable.js';
import { DiffIterableUtil } from './DiffIterableUtil.js';

export class ByWordRt {
  private static readonly NEW_LINE = 10;

  static compareAndSplit(
    text1: CharSequenceInterface,
    text2: CharSequenceInterface,
    policy: ComparisonPolicy,
  ): LineBlock[] {
    const words1 = ByWordRt.getInlineChunks(text1);
    const words2 = ByWordRt.getInlineChunks(text2);

    let wordChanges = DiffIterableUtil.diff(words1, words2);
    wordChanges = new WordChunkOptimizer(words1, words2, text1, text2, wordChanges).build();

    const wordBlocks = new LineFragmentSplitter(text1, text2, words1, words2, wordChanges).run();
    const lineBlocks: LineBlock[] = [];

    for (const block of wordBlocks) {
      const offsets = block.offsets;
      const words = block.words;

      const subText1 = text1.subSequence(offsets.start1, offsets.end1);
      const subText2 = text2.subSequence(offsets.start2, offsets.end2);

      const subWords1 = words1.slice(words.start1, words.end1);
      const subWords2 = words2.slice(words.start2, words.end2);

      const subiterable = DiffIterableUtil.fair(
        new SubiterableDiffIterable(wordChanges, words.start1, words.end1, words.start2, words.end2),
      );

      const delimitersIterable = DiffIterableUtil.matchAdjustmentDelimiters(
        subText1,
        subText2,
        subWords1,
        subWords2,
        subiterable,
        offsets.start1,
        offsets.start2,
      );

      const iterable = ByWordRt.matchAdjustmentWhitespaces(subText1, subText2, delimitersIterable, policy);
      const fragments = ByWordRt.convertIntoDiffFragments(iterable);

      lineBlocks.push(
        new LineBlock(fragments, offsets, ByWordRt.countNewlines(subWords1), ByWordRt.countNewlines(subWords2)),
      );
    }

    return lineBlocks;
  }

  static getInlineChunks(text: CharSequenceInterface): InlineChunk[] {
    let wordStart = -1;
    const chunks: InlineChunk[] = [];

    text.chars().forEach((char, offset) => {
      const ch = char.codePointAt(0)!;
      const isAlpha = Character.isAlpha(ch);
      const isWordPart = isAlpha && Character.isContinuousScript(ch) === false;

      if (isWordPart) {
        if (wordStart === -1) {
          wordStart = offset;
        }
      } else {
        if (wordStart !== -1) {
          chunks.push(new WordChunk(text, wordStart, offset));
          wordStart = -1;
        }

        if (isAlpha) {
          chunks.push(new WordChunk(text, offset, offset + 1));
        } else if (ch === ByWordRt.NEW_LINE) {
          chunks.push(new NewLineChunk(offset));
        }
      }
    });

    if (wordStart !== -1) {
      chunks.push(new WordChunk(text, wordStart, text.length()));
    }

    return chunks;
  }

  static comparePunctuation2Side(
    text1: CharSequenceInterface,
    text21: CharSequenceInterface,
    text22: CharSequenceInterface,
  ): [FairDiffIterableInterface, FairDiffIterableInterface] {
    const text2 = new MergingCharSequence(text21, text22);
    const changes = ByCharRt.comparePunctuation(text1, text2);

    const [first, second] = ByWordRt.splitIterable2Side(changes, text21.length());

    const iterable1 = DiffIterableUtil.fair(
      DiffIterableUtil.createUnchanged(first, text1.length(), text21.length()),
    );
    const iterable2 = DiffIterableUtil.fair(
      DiffIterableUtil.createUnchanged(second, text1.length(), text22.length()),
    );

    return [iterable1, iterable2];
  }

  static matchAdjustmentWhitespaces(
    text1: CharSequenceInterface,
    text2: CharSequenceInterface,
    iterable: FairDiffIterableInterface,
    policy: ComparisonPolicy,
  ): DiffIterableInterface {
    switch (policy) {
      case ComparisonPolicy.DEFAULT:
        return new DefaultCorrector(iterable, text1, text2).build();
      case ComparisonPolicy.TRIM_WHITESPACES:
        return new TrimSpacesCorrector(new DefaultCorrector(iterable, text1, text2).build(), text1, text2).build();
      case ComparisonPolicy.IGNORE_WHITESPACES:
        return new IgnoreSpacesCorrector(iterable, text1, text2).build();
      default:
        throw new Error('invalid policy');
    }
  }

  static convertIntoDiffFragments(changes: DiffIterableInterface): DiffFragmentInterface[] {
    const fragments: DiffFragmentInterface[] = [];
    for (const range of changes.changes()) {
      fragments.push(new DiffFragment(range.start1, range.end1, range.start2, range.end2));
    }
    return fragments;
  }

  static countNewlines(words: InlineChunk[]): number {
    let count = 0;
    for (const word of words) {
      if (word instanceof NewLineChunk) {
        count++;
      }
    }
    return count;
  }

  private static splitIterable2Side(changes: FairDiffIterableInterface, offset: number): [Range[], Range[]] {
    const ranges1: Range[] = [];
    const ranges2: Range[] = [];

    for (const ch of changes.unchanged()) {
      if (ch.end2 <= offset) {
        ranges1.push(new Range(ch.start1, ch.end1, ch.start2, ch.end2));
      } else if (ch.start2 >= offset) {
        ranges2.push(new Range(ch.start1, ch.end1, ch.start2 - offset, ch.end2 - offset));
      } else {
        const len2 = offset - ch.start2;
        ranges1.push(new Range(ch.start1, ch.start1 + len2, ch.start2, offset));
        ranges2.push(new Range(ch.start1 + len2, ch.end1, 0, ch.end2 - offset));
      }
    }

    return [ranges1, ranges2];
  }
}
