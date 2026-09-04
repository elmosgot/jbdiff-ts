import { describe, expect, it } from 'vitest';
import {
  compare,
  ComparisonPolicy,
  LineBlockTextIterator,
  TextPartType,
} from '@jbdiff/core';
import { buildSideBySideRows, renderInline, renderSideBySide } from '../src/render.js';

const beforeSnippet = `    "allow-plugins": {
        "symfony/flex": true,
        "php-http/discovery": true
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "src/"
        }
    }`;

const afterSnippet = `    "allow-plugins": {
        "symfony/flex": true,
        "php-http/discovery": true,
        "pestphp/pest-plugin": true
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "src/"
        }
    }`;

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

function partsFor(text1: string, text2: string) {
  const blocks = compare(text1, text2, ComparisonPolicy.TRIM_WHITESPACES);
  return [...new LineBlockTextIterator(text1, text2, blocks)];
}

describe('renderSideBySide', () => {
  it('highlights comma insertion and fully marks the new pestphp line', () => {
    const parts = partsFor(beforeSnippet, afterSnippet);
    const output = renderSideBySide(parts, { color: true });
    const plain = stripAnsi(output);
    const lines = plain.split('\n');

    const discoveryRow = lines.find((line) => line.includes('php-http/discovery'));
    const pestphpRow = lines.find((line) => line.includes('pestphp/pest-plugin'));
    const autoloadRow = lines.find((line) => line.includes('"autoload"'));

    expect(discoveryRow).toBeDefined();
    expect(pestphpRow).toBeDefined();
    expect(autoloadRow).toBeDefined();

    expect(discoveryRow).toMatch(/\+ .*true,/);
    expect(pestphpRow).toMatch(/\+ .*pestphp\/pest-plugin/);
    expect(autoloadRow).toMatch(/^  .*  + "autoload"/);

    expect(output).toContain('\x1b[32m,\x1b[0m');
    expect(output).toContain('\x1b[32m"pestphp/pest-plugin": true\x1b[0m');
  });

  it('does not mark unchanged rows with change gutters', () => {
    const parts = partsFor(beforeSnippet, afterSnippet);
    const rows = buildSideBySideRows(parts);

    const autoloadRows = rows.filter(
      (row) =>
        row.left.some((segment) => segment.text.includes('"autoload"')) ||
        row.right.some((segment) => segment.text.includes('"autoload"')),
    );

    expect(autoloadRows.length).toBeGreaterThan(0);
    for (const row of autoloadRows) {
      expect(row.left.some((segment) => segment.kind === 'removed')).toBe(false);
      expect(row.right.some((segment) => segment.kind === 'added')).toBe(false);
    }
  });

  it('keeps unchanged rows aligned after a line insertion under trim policy', () => {
    const before = `    "scripts": {
        "phpunit": "vendor/bin/phpunit",
        "rector": "@rector:fix --dry-run",
    }`;
    const after = `    "scripts": {
        "phpunit": "vendor/bin/phpunit",
        "pest": "vendor/bin/pest",
        "rector": "@rector:fix --dry-run",
    }`;

    const parts = partsFor(before, after);
    const plain = stripAnsi(renderSideBySide(parts, { color: false }));
    const lines = plain.split('\n');

    const rectorRow = lines.find((line) => line.includes('"rector"'));
    const closingRow = lines.find((line) => /}\s+}/.test(line));

    expect(rectorRow).toBeDefined();
    expect(closingRow).toBeDefined();
    expect(rectorRow).toMatch(/"rector".*"rector"/);
  });

  it('keeps multi-line added spans highlighted on every affected row', () => {
    const parts: Array<[number, string]> = [
      [TextPartType.UNCHANGED_BEFORE, 'line1: true'],
      [TextPartType.UNCHANGED_AFTER, 'line1: true'],
      [TextPartType.REMOVED, ''],
      [TextPartType.ADDED, ',\nline2: new'],
    ];

    const output = renderSideBySide(parts, { color: true });
    const plain = stripAnsi(output).split('\n');

    expect(plain[0]).toContain('line1: true,');
    expect(plain[1]).toContain('line2: new');
    expect(output.split('\n')[1]).toContain('\x1b[32mline2: new\x1b[0m');
  });
});

describe('renderInline', () => {
  it('puts inserted lines on their own line after the preceding content', () => {
    const before = `    "scripts": {\n        "phpunit": "vendor/bin/phpunit",\n        "rector": "@rector:fix --dry-run",\n    }`;
    const after = `    "scripts": {\n        "phpunit": "vendor/bin/phpunit",\n        "pest": "vendor/bin/pest",\n        "rector": "@rector:fix --dry-run",\n    }`;

    const parts = partsFor(before, after);
    const plain = stripAnsi(renderInline(parts, { color: true }));
    const lines = plain.split('\n');

    const pestLine = lines.find((line) => line.includes('"pest"'));
    const rectorLine = lines.find((line) => line.includes('"rector"'));

    expect(pestLine).toBeDefined();
    expect(rectorLine).toBeDefined();
    expect(pestLine).toMatch(/^ {8}"pest"/);
    expect(rectorLine).toMatch(/^ {8}"rector"/);
    expect(pestLine).not.toContain('"rector"');
    expect(rectorLine).not.toContain('"pest"');
    expect(lines.indexOf(pestLine!)).toBeLessThan(lines.indexOf(rectorLine!));
  });

  it('preserves indentation on modified lines', () => {
    const parts = partsFor(beforeSnippet, afterSnippet);
    const plain = stripAnsi(renderInline(parts, { color: true }));
    const lines = plain.split('\n');

    expect(lines.some((line) => line.startsWith('    "allow-plugins"'))).toBe(true);
    expect(lines.some((line) => line.startsWith('        "pestphp/pest-plugin"'))).toBe(true);
    expect(lines.some((line) => line.startsWith('    "autoload"'))).toBe(true);
  });

  it('highlights comma insertion without duplicating unchanged text', () => {
    const parts = partsFor(beforeSnippet, afterSnippet);
    const output = renderInline(parts, { color: true });
    const plain = stripAnsi(output);

    expect(plain).toContain('"php-http/discovery": true,');
    expect(plain).toContain('"pestphp/pest-plugin": true');
    expect(plain.match(/"autoload"/g)?.length).toBe(1);
    expect(output).toContain('\x1b[32m,\x1b[0m');
  });
});
