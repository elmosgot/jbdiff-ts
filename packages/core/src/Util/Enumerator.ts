import type { Equatable } from '../Entity/EquatableInterface.js';

export class Enumerator {
  private readonly numbers = new Map<number, number | Equatable>();
  private nextNumber = 1;

  enumerate(objects: Array<number | Equatable>, startShift: number, endCut: number): number[] {
    const len = objects.length - endCut;
    const idx: number[] = [];
    for (let i = startShift; i < len; i++) {
      idx.push(this.enumerateObject(objects[i]!));
    }
    return idx;
  }

  private enumerateObject(object: number | Equatable): number {
    let number = this.getInt(object);
    if (number === 0) {
      number = this.nextNumber++;
      this.numbers.set(number, object);
    }
    return number;
  }

  private getInt(object: number | Equatable): number {
    for (const [number, entry] of this.numbers) {
      if (
        typeof entry === 'object' &&
        typeof object === 'object' &&
        'equals' in entry &&
        'equals' in object
      ) {
        if ((entry as Equatable).equals(object as Equatable)) {
          return number;
        }
      } else if (entry === object) {
        return number;
      }
    }
    return 0;
  }
}
