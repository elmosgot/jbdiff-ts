import type { Equatable } from '../Entity/EquatableInterface.js';

export class Comparing {
  static equal(arg1: unknown, arg2: unknown): boolean {
    if (arg1 === arg2) {
      return true;
    }
    if (arg1 == null || arg2 == null) {
      return false;
    }

    if (
      typeof arg1 === 'object' &&
      typeof arg2 === 'object' &&
      'equals' in arg1 &&
      'equals' in arg2 &&
      typeof (arg1 as Equatable).equals === 'function'
    ) {
      return (arg1 as Equatable).equals(arg2 as Equatable);
    }

    return false;
  }
}
