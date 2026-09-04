export class Arrays {
  static binarySearch(array: number[], fromIndex: number, toIndex: number, search: number): number {
    let low = fromIndex;
    let high = toIndex - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midVal = array[mid] ?? 0;

      if (midVal < search) {
        low = mid + 1;
      } else if (midVal > search) {
        high = mid - 1;
      } else {
        return mid;
      }
    }

    return -(low + 1);
  }
}
