import { Change } from '../../Entity/Change/Change.js';
import { DiffIterableUtil } from '../DiffIterableUtil.js';
import type { DiffIterableInterface } from '../Comparison/Iterables/interfaces.js';

export abstract class AbstractChangeBuilder {
  protected index1 = 0;
  protected index2 = 0;

  constructor(
    protected readonly length1: number,
    protected readonly length2: number,
  ) {}

  getIndex1(): number {
    return this.index1;
  }

  getIndex2(): number {
    return this.index2;
  }

  markEqualCount(index1: number, index2: number, count = 1): void {
    this.markEqual(index1, index2, index1 + count, index2 + count);
  }

  markEqual(index1: number, index2: number, end1: number, end2: number): void {
    if (index1 === end1 && index2 === end2) {
      return;
    }

    if (this.index1 !== index1 || this.index2 !== index2) {
      this.addChange(this.index1, this.index2, index1, index2);
    }
    this.index1 = end1;
    this.index2 = end2;
  }

  protected doFinish(): void {
    if (this.length1 !== this.index1 || this.length2 !== this.index2) {
      this.addChange(this.index1, this.index2, this.length1, this.length2);
      this.index1 = this.length1;
      this.index2 = this.length2;
    }
  }

  protected abstract addChange(start1: number, start2: number, end1: number, end2: number): void;
}

export class ChangeBuilder extends AbstractChangeBuilder {
  private firstChange: Change | null = null;
  private lastChange: Change | null = null;

  protected addChange(start1: number, start2: number, end1: number, end2: number): void {
    const change = new Change(start1, start2, end1 - start1, end2 - start2);
    if (this.lastChange !== null) {
      this.lastChange.link = change;
    } else {
      this.firstChange = change;
    }
    this.lastChange = change;
  }

  finish(): DiffIterableInterface {
    this.doFinish();
    return DiffIterableUtil.create(this.firstChange, this.length1, this.length2);
  }
}
