import { Range } from '../Range.js';
import type { DiffFragmentInterface } from './DiffFragmentInterface.js';

export class LineBlock {
  constructor(
    public readonly fragments: DiffFragmentInterface[],
    public readonly offsets: Range,
    public readonly newlines1: number,
    public readonly newlines2: number,
  ) {}
}
