import { describe, expect, it } from 'vitest';
import { ComparisonPolicy } from '../src/ComparisonPolicy.js';
import { CharSequence } from '../src/Entity/Character/CharSequence.js';
import { NewLineChunk } from '../src/Entity/Chunk/NewLineChunk.js';
import { WordChunk } from '../src/Entity/Chunk/WordChunk.js';
import { Change } from '../src/Entity/Change/Change.js';
import { DiffFragment } from '../src/Entity/LineFragmentSplitter/DiffFragment.js';
import { Range } from '../src/Entity/Range.js';
import { ByWordRt } from '../src/Diff/ByWordRt.js';
import { DiffChangeDiffIterable } from '../src/Diff/Comparison/Iterables/DiffChangeDiffIterable.js';

describe('ByWordRt', () => {
  it('compareAndSplit default policy', () => {
    const text1 = 'unchanged old1 unchanged old2 unchanged';
    const text2 = 'unchanged new1 unchanged new2 unchanged';

    const lineBlocks = ByWordRt.compareAndSplit(
      CharSequence.fromString(text1),
      CharSequence.fromString(text2),
      ComparisonPolicy.DEFAULT,
    );

    expect(lineBlocks).toHaveLength(1);
    expect(lineBlocks[0]!.fragments).toEqual([
      new DiffFragment(10, 14, 10, 14),
      new DiffFragment(25, 29, 25, 29),
    ]);
  });

  it('compareAndSplit trim whitespace', () => {
    const text1 = 'unchanged old1 unchanged old2 unchanged';
    const text2 = '  unchanged new1 unchanged new2 unchanged  ';

    const lineBlocks = ByWordRt.compareAndSplit(
      CharSequence.fromString(text1),
      CharSequence.fromString(text2),
      ComparisonPolicy.TRIM_WHITESPACES,
    );

    expect(lineBlocks).toHaveLength(1);
    expect(lineBlocks[0]!.fragments).toEqual([
      new DiffFragment(10, 14, 12, 16),
      new DiffFragment(25, 29, 27, 31),
    ]);
  });

  it('compareAndSplit ignore whitespace', () => {
    const text1 = 'unchanged old1 unchanged old2 unchanged';
    const text2 = '  unchanged new1   unchanged   new2 unchanged  ';

    const lineBlocks = ByWordRt.compareAndSplit(
      CharSequence.fromString(text1),
      CharSequence.fromString(text2),
      ComparisonPolicy.IGNORE_WHITESPACES,
    );

    expect(lineBlocks).toHaveLength(1);
    expect(lineBlocks[0]!.fragments).toEqual([
      new DiffFragment(10, 14, 12, 16),
      new DiffFragment(25, 29, 31, 35),
    ]);
  });

  it('getInlineChunks two words', () => {
    const text = CharSequence.fromString('public int');
    const chunks = ByWordRt.getInlineChunks(text);

    expect(chunks).toEqual([
      new WordChunk(text, 0, 6),
      new WordChunk(text, 7, 10),
    ]);
  });

  it('getInlineChunks special character', () => {
    const text = CharSequence.fromString('public int codë() {');
    const chunks = ByWordRt.getInlineChunks(text);

    expect(chunks).toEqual([
      new WordChunk(text, 0, 6),
      new WordChunk(text, 7, 10),
      new WordChunk(text, 11, 15),
    ]);
    expect((chunks[2] as WordChunk).getContent()).toBe('codë');
  });

  it('getInlineChunks new lines A', () => {
    const text = CharSequence.fromString('public {\ntest');
    const chunks = ByWordRt.getInlineChunks(text);

    expect(chunks).toEqual([
      new WordChunk(text, 0, 6),
      new NewLineChunk(8),
      new WordChunk(text, 9, 13),
    ]);
  });

  it('getInlineChunks new lines', () => {
    const text = CharSequence.fromString('public int codë() {\ntest\n}\n');
    const chunks = ByWordRt.getInlineChunks(text);

    expect(chunks).toEqual([
      new WordChunk(text, 0, 6),
      new WordChunk(text, 7, 10),
      new WordChunk(text, 11, 15),
      new NewLineChunk(19),
      new WordChunk(text, 20, 24),
      new NewLineChunk(24),
      new NewLineChunk(26),
    ]);
  });

  it('comparePunctuation2Side', () => {
    const text1 = CharSequence.fromString('foo,bar(test)');
    const text21 = CharSequence.fromString('foo,bar');
    const text22 = CharSequence.fromString('(test)');

    const [iterable1, iterable2] = ByWordRt.comparePunctuation2Side(text1, text21, text22);

    const left = [...iterable1.changes()];
    const right = [...iterable2.changes()];

    expect(left).toEqual([new Range(0, 3, 0, 3), new Range(4, 13, 4, 7)]);
    expect(right).toEqual([new Range(0, 7, 0, 0), new Range(8, 12, 1, 5)]);
  });

  it('convertIntoDiffFragments', () => {
    const changeA = new Change(1, 1, 2, 4);
    const changeB = new Change(3, 5, 2, 1);
    changeA.link = changeB;

    const changeIterator = new DiffChangeDiffIterable(changeA, 10, 20);
    const fragments = ByWordRt.convertIntoDiffFragments(changeIterator);

    expect(fragments).toEqual([
      new DiffFragment(1, 3, 1, 5),
      new DiffFragment(3, 5, 5, 6),
    ]);
  });

  it('countNewlines', () => {
    expect(ByWordRt.countNewlines([])).toBe(0);

    const text = CharSequence.fromString('text');
    const chunks = [
      new WordChunk(text, 5, 6),
      new WordChunk(text, 5, 6),
      new NewLineChunk(35),
      new WordChunk(text, 5, 6),
      new NewLineChunk(35),
    ];

    expect(ByWordRt.countNewlines(chunks)).toBe(2);
  });
});
