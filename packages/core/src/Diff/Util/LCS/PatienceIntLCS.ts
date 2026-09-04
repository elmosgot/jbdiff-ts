import { BitSet } from '../../../Util/BitSet.js';
import { DiffToBigException } from '../DiffToBigException.js';
import { MyersLCS } from './MyersLCS.js';
import { UniqueLCS } from './UniqueLCS.js';

export class PatienceIntLCS {
  private readonly count1: number;
  private readonly count2: number;

  constructor(
    private readonly first: number[],
    private readonly second: number[],
    private readonly start1 = 0,
    count1: number | null = null,
    private readonly start2 = 0,
    count2: number | null = null,
    private readonly changes1 = new BitSet(),
    private readonly changes2 = new BitSet(),
  ) {
    this.count1 = count1 ?? first.length;
    this.count2 = count2 ?? second.length;
  }

  getChanges(): [BitSet, BitSet] {
    return [this.changes1, this.changes2];
  }

  execute(failOnSmallReduction = false): void {
    const thresholdCheckCounter = failOnSmallReduction ? 2 : -1;
    this.executeAlgorithm(this.start1, this.count1, this.start2, this.count2, thresholdCheckCounter);
  }

  private executeAlgorithm(
    start1: number,
    count1: number,
    start2: number,
    count2: number,
    thresholdCheckCounter: number,
  ): void {
    if (count1 === 0 && count2 === 0) {
      return;
    }

    if (count1 === 0 || count2 === 0) {
      this.addChange(start1, count1, start2, count2);
      return;
    }

    const startOffset = this.matchForward(start1, count1, start2, count2);
    start1 += startOffset;
    start2 += startOffset;
    count1 -= startOffset;
    count2 -= startOffset;

    const endOffset = this.matchBackward(start1, count1, start2, count2);
    count1 += endOffset;
    count2 += endOffset;

    if (count1 === 0 || count2 === 0) {
      this.addChange(start1, count1, start2, count2);
      return;
    }

    let counter = thresholdCheckCounter;
    if (counter === 0) {
      this.checkReduction(count1, count2);
    }
    counter = Math.max(-1, counter - 1);

    const uniqueLCS = new UniqueLCS(this.first, this.second, start1, count1, start2, count2);
    const matching = uniqueLCS.execute();

    if (matching === null) {
      if (counter >= 0) {
        this.checkReduction(count1, count2);
      }
      const intLCS = new MyersLCS(
        this.first,
        this.second,
        start1,
        count1,
        start2,
        count2,
        this.changes1,
        this.changes2,
      );
      intLCS.executeLinear();
      return;
    }

    const matched = matching[0]?.length ?? 0;
    const c1 = matching[0]?.[0] ?? 0;
    const c2 = matching[1]?.[0] ?? 0;

    this.executeAlgorithm(start1, c1, start2, c2, counter);

    const matchingLen = matching[0]!.length;
    for (let i = 1; i < matchingLen; i++) {
      const s1 = (matching[0]![i - 1] ?? 0) + 1;
      const s2 = (matching[1]![i - 1] ?? 0) + 1;
      const gap1 = (matching[0]![i] ?? 0) - s1;
      const gap2 = (matching[1]![i] ?? 0) - s2;

      if (gap1 > 0 || gap2 > 0) {
        this.executeAlgorithm(start1 + s1, gap1, start2 + s2, gap2, counter);
      }
    }

    let s1: number;
    let c1End: number;
    if ((matching[0]![matched - 1] ?? 0) === count1 - 1) {
      s1 = count1 - 1;
      c1End = 0;
    } else {
      s1 = (matching[0]![matched - 1] ?? 0) + 1;
      c1End = count1 - s1;
    }

    let s2: number;
    let c2End: number;
    if ((matching[1]![matched - 1] ?? 0) === count2 - 1) {
      s2 = count2 - 1;
      c2End = 0;
    } else {
      s2 = (matching[1]![matched - 1] ?? 0) + 1;
      c2End = count2 - s2;
    }

    this.executeAlgorithm(start1 + s1, c1End, start2 + s2, c2End, counter);
  }

  private matchForward(start1: number, count1: number, start2: number, count2: number): number {
    const size = Math.min(count1, count2);
    let idx = 0;
    for (let i = 0; i < size; i++) {
      if ((this.first[start1 + i] ?? 0) !== (this.second[start2 + i] ?? 0)) {
        break;
      }
      idx++;
    }
    return idx;
  }

  private matchBackward(start1: number, count1: number, start2: number, count2: number): number {
    const size = Math.min(count1, count2);
    let idx = 0;
    for (let i = 0; i <= size; i++) {
      if ((this.first[start1 + count1 - i] ?? 0) !== (this.second[start2 + count2 - i] ?? 0)) {
        break;
      }
      idx++;
    }
    return idx;
  }

  private addChange(start1: number, count1: number, start2: number, count2: number): void {
    this.changes1.set(start1, start1 + count1);
    this.changes2.set(start2, start2 + count2);
  }

  private checkReduction(count1: number, count2: number): void {
    if (count1 * 2 < this.count1) {
      return;
    }
    if (count2 * 2 < this.count2) {
      return;
    }
    throw new DiffToBigException();
  }
}
