import { ComparisonPolicy } from './ComparisonPolicy.js';
import { CharSequence } from './Entity/Character/CharSequence.js';
import { ByWordRt } from './Diff/ByWordRt.js';
import type { LineBlock } from './Entity/LineFragmentSplitter/LineBlock.js';

export function compare(text1: string, text2: string, policy: ComparisonPolicy = ComparisonPolicy.DEFAULT): LineBlock[] {
  return ByWordRt.compareAndSplit(CharSequence.fromString(text1), CharSequence.fromString(text2), policy);
}
