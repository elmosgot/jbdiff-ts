import { Arrays } from '../../../Util/Arrays.js';

export class UniqueLCS {
  private readonly count1: number;
  private readonly count2: number;

  constructor(
    private readonly first: number[],
    private readonly second: number[],
    private readonly start1 = 0,
    count1: number | null = null,
    private readonly start2 = 0,
    count2: number | null = null,
  ) {
    this.count1 = count1 ?? first.length;
    this.count2 = count2 ?? second.length;
  }

  execute(): number[][] | null {
    const map = new Map<number, number>();
    const match = new Map<number, number>();

    for (let i = 0; i < this.count1; i++) {
      const index = this.start1 + i;
      const key = this.first[index] ?? 0;
      const val = map.get(key) ?? 0;

      if (val === -1) {
        continue;
      }
      if (val === 0) {
        map.set(key, i + 1);
      } else {
        map.set(key, -1);
      }
    }

    let count = 0;
    for (let i = 0; i < this.count2; i++) {
      const index = this.start2 + i;
      const key = this.second[index] ?? 0;
      const val = map.get(key) ?? 0;

      if (val === 0 || val === -1) {
        continue;
      }
      if ((match.get(val - 1) ?? 0) === 0) {
        match.set(val - 1, i + 1);
        count++;
      } else {
        match.set(val - 1, 0);
        map.set(key, -1);
        count--;
      }
    }

    if (count === 0) {
      return null;
    }

    const sequence: number[] = [];
    const lastElement: number[] = [];
    const predecessor: number[] = [];

    let length = 0;
    for (let i = 0; i < this.count1; i++) {
      if ((match.get(i) ?? 0) === 0) {
        continue;
      }

      const matchVal = match.get(i)!;
      const j = UniqueLCS.binarySearch(sequence, matchVal, length);
      if (j === length || matchVal < (sequence[j] ?? 0)) {
        sequence[j] = matchVal;
        lastElement[j] = i;
        predecessor[i] = j > 0 ? (lastElement[j - 1] ?? 0) : -1;
        if (j === length) {
          length++;
        }
      }
    }

    const ret: number[][] = [[], []];

    let i = length - 1;
    let curr = lastElement[length - 1] ?? 0;
    while (curr !== -1) {
      ret[0]![i] = curr;
      ret[1]![i] = (match.get(curr) ?? 0) - 1;
      i--;
      curr = predecessor[curr]!;
    }

    return ret;
  }

  private static binarySearch(sequence: number[], val: number, length: number): number {
    const i = Arrays.binarySearch(sequence, 0, length, val);
    return -i - 1;
  }
}
