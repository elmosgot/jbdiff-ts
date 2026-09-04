import type { WordBlock } from './WordBlock.js';

export class PendingChunk {
  constructor(
    public block: WordBlock,
    public hasEqualWords: boolean,
    public hasWordsInside: boolean,
    public isEqualIgnoreWhitespaces: boolean,
  ) {}
}
