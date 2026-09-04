import type { Equatable } from './EquatableInterface.js';

export class Range implements Equatable {
  constructor(
    public readonly start1: number,
    public readonly end1: number,
    public readonly start2: number,
    public readonly end2: number,
  ) {}

  isEmpty(): boolean {
    return this.start1 === this.end1 && this.start2 === this.end2;
  }

  equals(object: Equatable): boolean {
    if (!(object instanceof Range)) {
      return false;
    }
    if (object === this) {
      return true;
    }
    return (
      this.start1 === object.start1 &&
      this.end1 === object.end1 &&
      this.start2 === object.start2 &&
      this.end2 === object.end2
    );
  }

  toString(): string {
    return `[${this.start1}, ${this.end1}] - [${this.start2}, ${this.end2}]`;
  }
}
