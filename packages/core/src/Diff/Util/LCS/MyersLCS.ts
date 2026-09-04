import { BitSet } from '../../../Util/BitSet.js';
import { DiffConfig } from '../DiffConfig.js';
import { DiffToBigException } from '../DiffToBigException.js';

export class MyersLCS {
  private readonly count1: number;
  private readonly count2: number;
  private readonly vForward: number[] = [];
  private readonly vBackward: number[] = [];

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
    this.changes1.set(this.start1, this.start1 + this.count1);
    this.changes2.set(this.start2, this.start2 + this.count2);
  }

  getChanges(): [BitSet, BitSet] {
    return [this.changes1, this.changes2];
  }

  executeLinear(): void {
    const threshold = 20000 + 10 * Math.floor(Math.sqrt(this.count1 + this.count2));
    this.execute(threshold, false);
  }

  executeWithThreshold(): void {
    const threshold = Math.max(
      20000 + 10 * Math.floor(Math.sqrt(this.count1 + this.count2)),
      DiffConfig.DELTA_THRESHOLD_SIZE,
    );
    this.execute(threshold, true);
  }

  private execute(threshold: number, throwException: boolean): void {
    if (this.count1 === 0 || this.count2 === 0) {
      return;
    }
    this.executeAlgorithm(
      0,
      this.count1,
      0,
      this.count2,
      Math.min(threshold, this.count1 + this.count2),
      throwException,
    );
  }

  private executeAlgorithm(
    oldStart: number,
    oldEnd: number,
    newStart: number,
    newEnd: number,
    differenceEstimate: number,
    throwException: boolean,
  ): void {
    if (oldStart >= oldEnd || newStart >= newEnd) {
      return;
    }

    const oldLength = oldEnd - oldStart;
    const newLength = newEnd - newStart;

    this.vForward[newLength + 1] = 0;
    this.vBackward[newLength + 1] = 0;

    const halfD = Math.floor((differenceEstimate + 1) / 2);
    let xx = -1;
    let kk = -1;
    let td = -1;

    outer: for (let d = 0; d <= halfD; d++) {
      const L = newLength + Math.max(-d, -newLength + ((d ^ newLength) & 1));
      const R = newLength + Math.min(d, oldLength - ((d ^ oldLength) & 1));

      for (let k = L; k <= R; k += 2) {
        const x =
          k === L || (k !== R && (this.vForward[k - 1] ?? 0) < (this.vForward[k + 1] ?? 0))
            ? this.vForward[k + 1]!
            : (this.vForward[k - 1] ?? 0) + 1;

        let y = x - k + newLength;
        const common = this.commonSubsequenceLengthForward(
          oldStart + x,
          newStart + y,
          Math.min(oldEnd - oldStart - x, newEnd - newStart - y),
        );
        this.vForward[k] = x + common;
      }

      if ((oldLength - newLength) % 2 !== 0) {
        for (let k = L; k <= R; k += 2) {
          if (oldLength - (d - 1) <= k && k <= oldLength + (d - 1)) {
            if ((this.vForward[k] ?? 0) + (this.vBackward[newLength + oldLength - k] ?? 0) >= oldLength) {
              xx = this.vForward[k]!;
              kk = k;
              td = 2 * d - 1;
              break outer;
            }
          }
        }
      }

      for (let k = L; k <= R; k += 2) {
        const x =
          k === L || (k !== R && (this.vBackward[k - 1] ?? 0) < (this.vBackward[k + 1] ?? 0))
            ? this.vBackward[k + 1]!
            : (this.vBackward[k - 1] ?? 0) + 1;

        let y = x - k + newLength;
        const common = this.commonSubsequenceLengthBackward(
          oldEnd - 1 - x,
          newEnd - 1 - y,
          Math.min(oldEnd - oldStart - x, newEnd - newStart - y),
        );
        this.vBackward[k] = x + common;
      }

      if ((oldLength - newLength) % 2 === 0) {
        for (let k = L; k <= R; k += 2) {
          if (oldLength - d <= k && k <= oldLength + d) {
            if (
              (this.vForward[oldLength + newLength - k] ?? 0) + (this.vBackward[k] ?? 0) >=
              oldLength
            ) {
              xx = oldLength - (this.vBackward[k] ?? 0);
              kk = oldLength + newLength - k;
              td = 2 * d;
              break outer;
            }
          }
        }
      }
    }

    if (td > 1) {
      const yy = xx - kk + newLength;
      const oldDiff = Math.floor((td + 1) / 2);
      if (0 < xx && 0 < yy) {
        this.executeAlgorithm(oldStart, oldStart + xx, newStart, newStart + yy, oldDiff, throwException);
      }
      if (oldStart + xx < oldEnd && newStart + yy < newEnd) {
        this.executeAlgorithm(oldStart + xx, oldEnd, newStart + yy, newEnd, td - oldDiff, throwException);
      }
    } else if (td >= 0) {
      let x = oldStart;
      let y = newStart;
      while (x < oldEnd && y < newEnd) {
        const commonLength = this.commonSubsequenceLengthForward(x, y, Math.min(oldEnd - x, newEnd - y));
        if (commonLength > 0) {
          this.addUnchanged(x, y, commonLength);
          x += commonLength;
          y += commonLength;
        } else if (oldEnd - oldStart > newEnd - newStart) {
          x++;
        } else {
          y++;
        }
      }
    } else if (throwException) {
      throw new DiffToBigException();
    }
  }

  private addUnchanged(start1: number, start2: number, count: number): void {
    this.changes1.clear(this.start1 + start1, this.start1 + start1 + count);
    this.changes2.clear(this.start2 + start2, this.start2 + start2 + count);
  }

  private commonSubsequenceLengthForward(oldIndex: number, newIndex: number, maxLength: number): number {
    let x = oldIndex;
    let y = newIndex;
    maxLength = Math.min(maxLength, this.count1 - oldIndex, this.count2 - newIndex);
    while (x - oldIndex < maxLength && this.first[this.start1 + x] === this.second[this.start2 + y]) {
      x++;
      y++;
    }
    return x - oldIndex;
  }

  private commonSubsequenceLengthBackward(oldIndex: number, newIndex: number, maxLength: number): number {
    let x = oldIndex;
    let y = newIndex;
    maxLength = Math.min(maxLength, Math.min(oldIndex, newIndex) + 1);
    while (oldIndex - x < maxLength && this.first[this.start1 + x] === this.second[this.start2 + y]) {
      x--;
      y--;
    }
    return oldIndex - x;
  }
}
