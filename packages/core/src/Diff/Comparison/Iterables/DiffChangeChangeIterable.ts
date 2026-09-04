import type { Change } from '../../../Entity/Change/Change.js';
import type { ChangeIterableInterface } from './interfaces.js';

export class DiffChangeChangeIterable implements ChangeIterableInterface {
  constructor(private change: Change | null) {}

  valid(): boolean {
    return this.change !== null;
  }

  next(): void {
    this.change = this.change!.link;
  }

  getStart1(): number {
    return this.change!.line0;
  }

  getStart2(): number {
    return this.change!.line1;
  }

  getEnd1(): number {
    return this.change!.line0 + this.change!.deleted;
  }

  getEnd2(): number {
    return this.change!.line1 + this.change!.inserted;
  }
}
