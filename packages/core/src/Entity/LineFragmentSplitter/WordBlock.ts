import { Range } from '../Range.js';

export class WordBlock {
  constructor(
    public readonly words: Range,
    public readonly offsets: Range,
  ) {}
}
