import { Change } from '../../Entity/Change/Change.js';
import { NullChange } from '../../Entity/Change/NullChange.js';
import type { Equatable } from '../../Entity/EquatableInterface.js';
import { Enumerator } from '../../Util/Enumerator.js';
import { DiffConfig } from './DiffConfig.js';
import { DiffToBigException } from './DiffToBigException.js';
import { LCSChangeBuilder } from './LCSChangeBuilder.js';
import { MyersLCS } from './LCS/MyersLCS.js';
import { PatienceIntLCS } from './LCS/PatienceIntLCS.js';
import { Reindexer } from './Reindexer.js';

export class Diff {
  buildChanges(objects1: Array<number | Equatable>, objects2: Array<number | Equatable>): Change | null {
    const startShift = this.getStartShift(objects1, objects2);
    const endCut = this.getEndCut(objects1, objects2, startShift);

    const change = this.doBuildChangesFast(objects1.length, objects2.length, startShift, endCut);
    if (change !== null) {
      return change;
    }

    const enumerator = new Enumerator();
    const ints1 = enumerator.enumerate(objects1, startShift, endCut);
    const ints2 = enumerator.enumerate(objects2, startShift, endCut);

    return this.doBuildChanges(ints1, ints2, new LCSChangeBuilder(startShift));
  }

  private doBuildChanges(ints1: number[], ints2: number[], builder: LCSChangeBuilder): Change | null {
    const reindexer = new Reindexer();
    const discarded = reindexer.discardUnique(ints1, ints2);

    if (discarded[0].length === 0 && discarded[1].length === 0) {
      builder.addChange(ints1.length, ints2.length);
      return builder.getFirstChange();
    }

    let changes: [ReturnType<MyersLCS['getChanges']>[0], ReturnType<MyersLCS['getChanges']>[1]];
    if (DiffConfig.USE_PATIENCE_ALG) {
      const patienceIntLCS = new PatienceIntLCS(discarded[0], discarded[1]);
      patienceIntLCS.execute();
      changes = patienceIntLCS.getChanges();
    } else {
      try {
        const intLCS = new MyersLCS(discarded[0], discarded[1]);
        intLCS.executeWithThreshold();
        changes = intLCS.getChanges();
      } catch (e) {
        if (!(e instanceof DiffToBigException)) {
          throw e;
        }
        const patienceIntLCS = new PatienceIntLCS(discarded[0], discarded[1]);
        patienceIntLCS.execute(true);
        changes = patienceIntLCS.getChanges();
      }
    }

    reindexer.reindex(changes, builder);
    return builder.getFirstChange();
  }

  private getStartShift(objects1: Array<number | Equatable>, objects2: Array<number | Equatable>): number {
    const size = Math.min(objects1.length, objects2.length);
    let index = 0;

    for (let i = 0; i < size; i++) {
      const object1 = objects1[i]!;
      const object2 = objects2[i]!;

      if (
        typeof object1 === 'object' &&
        typeof object2 === 'object' &&
        'equals' in object1 &&
        'equals' in object2
      ) {
        if (!(object1 as Equatable).equals(object2 as Equatable)) {
          break;
        }
      } else if (object1 !== object2) {
        break;
      }
      index++;
    }

    return index;
  }

  private getEndCut(objects1: Array<number | Equatable>, objects2: Array<number | Equatable>, startShift: number): number {
    const length1 = objects1.length;
    const length2 = objects2.length;
    const size = Math.min(length1, length2) - startShift;
    let index = 0;

    for (let i = 0; i < size; i++) {
      const object1 = objects1[length1 - i - 1]!;
      const object2 = objects2[length2 - i - 1]!;

      if (
        typeof object1 === 'object' &&
        typeof object2 === 'object' &&
        'equals' in object1 &&
        'equals' in object2
      ) {
        if (!(object1 as Equatable).equals(object2 as Equatable)) {
          break;
        }
      } else if (object1 !== object2) {
        break;
      }
      index++;
    }

    return index;
  }

  private doBuildChangesFast(length1: number, length2: number, startShift: number, endCut: number): Change | null {
    const trimmedLength1 = length1 - startShift - endCut;
    const trimmedLength2 = length2 - startShift - endCut;

    if (trimmedLength1 !== 0 && trimmedLength2 !== 0) {
      return null;
    }

    if (trimmedLength1 === 0 && trimmedLength2 === 0) {
      return new NullChange();
    }

    return new Change(startShift, startShift, trimmedLength1, trimmedLength2);
  }
}
