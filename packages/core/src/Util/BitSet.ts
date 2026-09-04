export class BitSet {
  private static readonly ADDRESS_BITS_PER_WORD = 6;
  private static readonly WORD_MASK = 0x3f;
  private static readonly MAX_WORD_SLOT = 64;
  private static readonly MASK_ALL = (1n << 64n) - 1n;

  private readonly words = new Map<number, bigint>();

  set(fromIndex: number, toIndex?: number): this {
    for (const [wordIdx, value] of BitSet.getWords(fromIndex, toIndex)) {
      this.words.set(wordIdx, (this.words.get(wordIdx) ?? 0n) | value);
    }
    return this;
  }

  clear(fromIndex: number, toIndex?: number): void {
    for (const [wordIdx, value] of BitSet.getWords(fromIndex, toIndex)) {
      const current = this.words.get(wordIdx);
      if (current === undefined) {
        continue;
      }
      const next = current & (BitSet.MASK_ALL ^ value);
      if (next === 0n) {
        this.words.delete(wordIdx);
      } else {
        this.words.set(wordIdx, next);
      }
    }
  }

  has(bitIndex: number): boolean {
    const wordIdx = bitIndex >> BitSet.ADDRESS_BITS_PER_WORD;
    const bitIdx = bitIndex & BitSet.WORD_MASK;
    return (((this.words.get(wordIdx) ?? 0n) >> BigInt(bitIdx)) & 1n) !== 0n;
  }

  toString(): string {
    let result = '';
    for (const [index, bits] of this.words) {
      result += `${index}: ${bits.toString(2).padStart(BitSet.MAX_WORD_SLOT, '0')}\n`;
    }
    return result;
  }

  private static getWords(fromIndex: number, toIndex?: number): Map<number, bigint> {
    if (fromIndex === toIndex) {
      return new Map();
    }

    const endIndex = toIndex === undefined ? fromIndex : toIndex - 1;
    const startWordIdx = fromIndex >> BitSet.ADDRESS_BITS_PER_WORD;
    const endWordIdx = endIndex >> BitSet.ADDRESS_BITS_PER_WORD;

    const startBitMask = BitSet.MASK_ALL << BigInt(fromIndex % BitSet.MAX_WORD_SLOT);
    const endBitMask = (BitSet.MASK_ALL << BigInt((endIndex % BitSet.MAX_WORD_SLOT) + 1)) ^ BitSet.MASK_ALL;

    const words = new Map<number, bigint>();

    if (startWordIdx === endWordIdx) {
      words.set(startWordIdx, startBitMask & endBitMask);
      return words;
    }

    for (let wordIdx = startWordIdx; wordIdx <= endWordIdx; wordIdx++) {
      if (wordIdx === startWordIdx) {
        words.set(wordIdx, startBitMask);
      } else if (wordIdx === endWordIdx) {
        words.set(wordIdx, endBitMask);
      } else {
        words.set(wordIdx, BitSet.MASK_ALL);
      }
    }

    return words;
  }
}
