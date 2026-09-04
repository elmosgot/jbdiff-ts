import type { CharSequenceInterface } from '../../Entity/Character/CharSequenceInterface.js';
import type { InlineChunk } from '../../Entity/Chunk/InlineChunk.js';
import { ByCharRt } from '../ByCharRt.js';
import { ByWordRt } from '../ByWordRt.js';
import { DiffIterableUtil } from '../DiffIterableUtil.js';
import type { FairDiffIterableInterface } from '../Comparison/Iterables/interfaces.js';
import { ChangeBuilder } from './ChangeBuilder.js';

export class AdjustmentPunctuationMatcher {
  private readonly len1: number;
  private readonly len2: number;
  private readonly builder: ChangeBuilder;

  private lastStart1 = -1;
  private lastStart2 = -1;
  private lastEnd1 = -1;
  private lastEnd2 = -1;

  constructor(
    private readonly text1: CharSequenceInterface,
    private readonly text2: CharSequenceInterface,
    private readonly words1: InlineChunk[],
    private readonly words2: InlineChunk[],
    private readonly startShift1: number,
    private readonly startShift2: number,
    private readonly changes: FairDiffIterableInterface,
  ) {
    this.len1 = this.text1.length();
    this.len2 = this.text2.length();
    this.builder = new ChangeBuilder(this.len1, this.len2);
  }

  build(): FairDiffIterableInterface {
    this.execute();
    return DiffIterableUtil.fair(this.builder.finish());
  }

  private execute(): void {
    this.clearLastRange();
    this.matchForward(-1, -1);

    for (const ch of this.changes.unchanged()) {
      const count = ch.end1 - ch.start1;
      for (let i = 0; i < count; i++) {
        const index1 = ch.start1 + i;
        const index2 = ch.start2 + i;

        const start1 = this.getStartOffset1(index1);
        const start2 = this.getStartOffset2(index2);
        const end1 = this.getEndOffset1(index1);
        const end2 = this.getEndOffset2(index2);

        this.matchBackward(index1, index2);
        this.builder.markEqual(start1, start2, end1, end2);
        this.matchForward(index1, index2);
      }
    }

    this.matchBackward(this.words1.length, this.words2.length);
  }

  private clearLastRange(): void {
    this.lastStart1 = -1;
    this.lastStart2 = -1;
    this.lastEnd1 = -1;
    this.lastEnd2 = -1;
  }

  private matchBackward(index1: number, index2: number): void {
    const start1 = index1 === 0 ? 0 : this.getEndOffset1(index1 - 1);
    const start2 = index2 === 0 ? 0 : this.getEndOffset2(index2 - 1);
    const end1 = index1 === this.words1.length ? this.len1 : this.getStartOffset1(index1);
    const end2 = index2 === this.words2.length ? this.len2 : this.getStartOffset2(index2);

    this.matchBackwardRange(start1, start2, end1, end2);
    this.clearLastRange();
  }

  private matchBackwardRange(start1: number, start2: number, end1: number, end2: number): void {
    if (this.lastStart1 === start1 && this.lastStart2 === start2) {
      this.matchRange(start1, start2, end1, end2);
      return;
    }

    if (this.lastStart1 < start1 && this.lastStart2 < start2) {
      this.matchRange(this.lastStart1, this.lastStart2, this.lastEnd1, this.lastEnd2);
      this.matchRange(start1, start2, end1, end2);
      return;
    }

    this.matchComplexRange(
      this.lastStart1,
      this.lastStart2,
      this.lastEnd1,
      this.lastEnd2,
      start1,
      start2,
      end1,
      end2,
    );
  }

  private matchForward(index1: number, index2: number): void {
    const start1 = index1 === -1 ? 0 : this.getEndOffset1(index1);
    const start2 = index2 === -1 ? 0 : this.getEndOffset2(index2);
    const end1 = index1 + 1 === this.words1.length ? this.len1 : this.getStartOffset1(index1 + 1);
    const end2 = index2 + 1 === this.words2.length ? this.len2 : this.getStartOffset2(index2 + 1);

    this.matchForwardRange(start1, start2, end1, end2);
  }

  private matchForwardRange(start1: number, start2: number, end1: number, end2: number): void {
    this.lastStart1 = start1;
    this.lastStart2 = start2;
    this.lastEnd1 = end1;
    this.lastEnd2 = end2;
  }

  private matchRange(start1: number, start2: number, end1: number, end2: number): void {
    if (start1 === end1 && start2 === end2) {
      return;
    }

    const sequence1 = this.text1.subSequence(start1, end1);
    const sequence2 = this.text2.subSequence(start2, end2);
    const changes = ByCharRt.comparePunctuation(sequence1, sequence2);

    for (const ch of changes.unchanged()) {
      this.builder.markEqual(start1 + ch.start1, start2 + ch.start2, start1 + ch.end1, start2 + ch.end2);
    }
  }

  private matchComplexRange(
    start11: number,
    start12: number,
    end11: number,
    end12: number,
    start21: number,
    start22: number,
    end21: number,
    end22: number,
  ): void {
    if (start11 === start21 && end11 === end21) {
      this.matchComplexRangeLeft(start11, end11, start12, end12, start22, end22);
    } else if (start12 === start22 && end12 === end22) {
      this.matchComplexRangeRight(start12, end12, start11, end11, start21, end21);
    } else {
      throw new Error('Unable to calculate match complex range');
    }
  }

  private matchComplexRangeLeft(
    start1: number,
    end1: number,
    start12: number,
    end12: number,
    start22: number,
    end22: number,
  ): void {
    const sequence1 = this.text1.subSequence(start1, end1);
    const sequence21 = this.text2.subSequence(start12, end12);
    const sequence22 = this.text2.subSequence(start22, end22);

    const [first, second] = ByWordRt.comparePunctuation2Side(sequence1, sequence21, sequence22);
    for (const ch of first.unchanged()) {
      this.builder.markEqual(start1 + ch.start1, start12 + ch.start2, start1 + ch.end1, start12 + ch.end2);
    }
    for (const ch of second.unchanged()) {
      this.builder.markEqual(start1 + ch.start1, start22 + ch.start2, start1 + ch.end1, start22 + ch.end2);
    }
  }

  private matchComplexRangeRight(
    start2: number,
    end2: number,
    start11: number,
    end11: number,
    start21: number,
    end21: number,
  ): void {
    const sequence11 = this.text1.subSequence(start11, end11);
    const sequence12 = this.text1.subSequence(start21, end21);
    const sequence2 = this.text2.subSequence(start2, end2);

    const [first, second] = ByWordRt.comparePunctuation2Side(sequence2, sequence11, sequence12);
    for (const ch of first.unchanged()) {
      this.builder.markEqual(start11 + ch.start2, start2 + ch.start1, start11 + ch.end2, start2 + ch.end1);
    }
    for (const ch of second.unchanged()) {
      this.builder.markEqual(start21 + ch.start2, start2 + ch.start1, start21 + ch.end2, start2 + ch.end1);
    }
  }

  private getStartOffset1(index: number): number {
    return this.words1[index]!.getOffset1() - this.startShift1;
  }

  private getStartOffset2(index: number): number {
    return this.words2[index]!.getOffset1() - this.startShift2;
  }

  private getEndOffset1(index: number): number {
    return this.words1[index]!.getOffset2() - this.startShift1;
  }

  private getEndOffset2(index: number): number {
    return this.words2[index]!.getOffset2() - this.startShift2;
  }
}
