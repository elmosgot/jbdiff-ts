import { BitSet } from '../../Util/BitSet.js';
import type { LCSBuilderInterface } from './LCSBuilderInterface.js';

export class Reindexer {
  private oldIndices: number[][] = [[], []];
  private originalLengths: [number, number] = [-1, 1];
  private discardedLengths: [number, number] = [-1, 1];

  discardUnique(ints1: number[], ints2: number[]): [number[], number[]] {
    const discarded = this.discard(ints2, ints1, 0);
    return [discarded, this.discard(discarded, ints2, 1)];
  }

  reindex(discardedChanges: [BitSet, BitSet], builder: LCSBuilderInterface): void {
    let changes1: BitSet;
    let changes2: BitSet;

    if (
      this.discardedLengths[0] === this.originalLengths[0] &&
      this.discardedLengths[1] === this.originalLengths[1]
    ) {
      changes1 = discardedChanges[0];
      changes2 = discardedChanges[1];
    } else {
      changes1 = new BitSet();
      changes2 = new BitSet();

      let x = 0;
      let y = 0;
      while (x < this.discardedLengths[0] || y < this.discardedLengths[1]) {
        if (
          x < this.discardedLengths[0] &&
          y < this.discardedLengths[1] &&
          !discardedChanges[0].has(x) &&
          !discardedChanges[1].has(y)
        ) {
          x = Reindexer.increment(this.oldIndices[0]!, x, changes1, this.originalLengths[0]);
          y = Reindexer.increment(this.oldIndices[1]!, y, changes2, this.originalLengths[1]);
        } else if (discardedChanges[0].has(x)) {
          changes1.set(Reindexer.getOriginal(this.oldIndices[0]!, x));
          x = Reindexer.increment(this.oldIndices[0]!, x, changes1, this.originalLengths[0]);
        } else if (discardedChanges[1].has(y)) {
          changes2.set(Reindexer.getOriginal(this.oldIndices[1]!, y));
          y = Reindexer.increment(this.oldIndices[1]!, y, changes2, this.originalLengths[1]);
        }
      }

      if (this.discardedLengths[0] === 0) {
        changes1.set(0, this.originalLengths[0]);
      } else {
        changes1.set(0, this.oldIndices[0]![0]!);
      }
      if (this.discardedLengths[1] === 0) {
        changes2.set(0, this.originalLengths[1]);
      } else {
        changes2.set(0, this.oldIndices[1]![0]!);
      }
    }

    let x = 0;
    let y = 0;
    while (x < this.originalLengths[0] && y < this.originalLengths[1]) {
      const startX = x;
      while (
        x < this.originalLengths[0] &&
        y < this.originalLengths[1] &&
        !changes1.has(x) &&
        !changes2.has(y)
      ) {
        x++;
        y++;
      }

      if (x > startX) {
        builder.addEqual(x - startX);
      }

      let dx = 0;
      let dy = 0;
      while (x < this.originalLengths[0] && changes1.has(x)) {
        dx++;
        x++;
      }
      while (y < this.originalLengths[1] && changes2.has(y)) {
        dy++;
        y++;
      }
      if (dx !== 0 || dy !== 0) {
        builder.addChange(dx, dy);
      }
    }

    if (x !== this.originalLengths[0] || y !== this.originalLengths[1]) {
      builder.addChange(this.originalLengths[0] - x, this.originalLengths[1] - y);
    }
  }

  private discard(needed: number[], toDiscard: number[], arrayIndex: 0 | 1): number[] {
    const neededSet = new Set(needed);
    const discarded: number[] = [];
    const oldIndices: number[] = [];

    for (let i = 0; i < toDiscard.length; i++) {
      const value = toDiscard[i]!;
      if (neededSet.has(value)) {
        discarded.push(value);
        oldIndices.push(i);
      }
    }

    this.oldIndices[arrayIndex] = oldIndices;
    this.originalLengths[arrayIndex] = toDiscard.length;
    this.discardedLengths[arrayIndex] = discarded.length;

    return discarded;
  }

  private static getOriginal(indexes: number[], i: number): number {
    return indexes[i]!;
  }

  private static increment(indexes: number[], i: number, set: BitSet, length: number): number {
    if (i + 1 < indexes.length) {
      set.set(indexes[i]! + 1, indexes[i + 1]);
    } else {
      set.set(indexes[i]! + 1, length);
    }
    return i + 1;
  }
}
