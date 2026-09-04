import { describe, expect, it } from 'vitest';
import { compare, ComparisonPolicy, DiffFragment, LineBlockTextIterator } from '../src/index.js';

const textBefore = `switch ($strategy) {
    case RateLimiterConfig::FIXED_WINDOW:
        return new FixedWindow($this->redisService->getConnection(), $config);
    case RateLimiterConfig::SLIDING_WINDOW:
        return new SlidingWindow($this->redisService->getConnection(), $config);
    default:
        throw new RuntimeException('Invalid Strategy name.', RuntimeException::UNKNOWN);
}`;

const textAfter = `return match ($strategy) {
    RateLimiterConfig::FIXED_WINDOW   => new FixedWindow($this->redisService->getConnection(), $config),
    RateLimiterConfig::SLIDING_WINDOW => new SlidingWindow($this->redisService->getConnection(), $config),
    default                           => throw new RuntimeException('Invalid Strategy name.'),
};`;

describe('README switch->match golden test', () => {
  it('produces line blocks with diff fragments for switch to match refactor', () => {
    const lineBlocks = compare(textBefore, textAfter, ComparisonPolicy.DEFAULT);

    expect(lineBlocks.length).toBeGreaterThan(0);

    const totalFragments = lineBlocks.reduce((sum, block) => sum + block.fragments.length, 0);
    expect(totalFragments).toBeGreaterThan(0);

    const iterator = new LineBlockTextIterator(textBefore, textAfter, lineBlocks);
    expect(iterator.hasChanges()).toBe(true);

    const parts = [...iterator];
    const removed = parts.filter(([type]) => type === 1).map(([, text]) => text).join('');
    const added = parts.filter(([type]) => type === 4).map(([, text]) => text).join('');

    expect(removed).toContain('switch');
    expect(added).toContain('return match');
    expect(added).toContain('=>');
  });

  it('exports DiffFragment with expected shape', () => {
    const lineBlocks = compare('foo bar', 'foo baz', ComparisonPolicy.DEFAULT);
    const fragment = lineBlocks[0]!.fragments[0] as DiffFragment;

    expect(fragment.getStartOffset1()).toBeGreaterThanOrEqual(0);
    expect(fragment.getEndOffset1()).toBeGreaterThan(fragment.getStartOffset1());
    expect(fragment.getStartOffset2()).toBeGreaterThanOrEqual(0);
    expect(fragment.getEndOffset2()).toBeGreaterThan(fragment.getStartOffset2());
  });
});
