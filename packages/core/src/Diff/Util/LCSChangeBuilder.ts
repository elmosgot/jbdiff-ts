import { Change } from '../../Entity/Change/Change.js';
import type { LCSBuilderInterface } from './LCSBuilderInterface.js';

export class LCSChangeBuilder implements LCSBuilderInterface {
  private myIndex1 = 0;
  private myIndex2 = 0;
  private myFirstChange: Change | null = null;
  private myLastChange: Change | null = null;

  constructor(startShift: number) {
    this.skip(startShift, startShift);
  }

  private skip(first: number, second: number): void {
    this.myIndex1 += first;
    this.myIndex2 += second;
  }

  addChange(first: number, second: number): void {
    const change = new Change(this.myIndex1, this.myIndex2, first, second, null);
    if (this.myLastChange !== null) {
      this.myLastChange.link = change;
    } else {
      this.myFirstChange = change;
    }
    this.myLastChange = change;
    this.skip(first, second);
  }

  addEqual(length: number): void {
    this.skip(length, length);
  }

  getFirstChange(): Change | null {
    return this.myFirstChange;
  }
}
