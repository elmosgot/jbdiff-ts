#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  compare,
  ComparisonPolicy,
  LineBlockTextIterator,
} from '@jbdiff/core';
import { renderInline, renderSideBySide } from './render.js';

const HELP = `jbdiff — IntelliJ-style word diff (CLI)

Usage:
  jbdiff [options] <file1> <file2>
  jbdiff --difftool <file1> <file2>   # git difftool wrapper ($LOCAL $REMOTE)

Options:
  --policy <name>     default | trim | ignore  (default: default)
  --format <name>     inline | side-by-side    (default: inline)
  --no-color          disable ANSI colors
  --difftool          read paths from LOCAL/REMOTE env when args omitted
  -h, --help          show help

Git difftool example (~/.gitconfig):
  [difftool "jbdiff"]
    cmd = jbdiff --difftool \\"$LOCAL\\" \\"$REMOTE\\"
`;

function parsePolicy(value: string): ComparisonPolicy {
  switch (value.toLowerCase()) {
    case 'default':
      return ComparisonPolicy.DEFAULT;
    case 'trim':
    case 'trim-whitespaces':
      return ComparisonPolicy.TRIM_WHITESPACES;
    case 'ignore':
    case 'ignore-whitespaces':
      return ComparisonPolicy.IGNORE_WHITESPACES;
    default:
      throw new Error(`Unknown policy: ${value}`);
  }
}

function readText(path: string): string {
  return readFileSync(resolve(path), 'utf8');
}

function main(): void {
  const args = process.argv.slice(2);
  let policy = ComparisonPolicy.DEFAULT;
  let format: 'inline' | 'side-by-side' = 'inline';
  let color = process.stdout.isTTY;
  let difftool = false;
  const files: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    switch (arg) {
      case '-h':
      case '--help':
        process.stdout.write(HELP);
        return;
      case '--policy':
        policy = parsePolicy(args[++i] ?? '');
        break;
      case '--format':
        format = args[++i] === 'side-by-side' ? 'side-by-side' : 'inline';
        break;
      case '--no-color':
        color = false;
        break;
      case '--difftool':
        difftool = true;
        break;
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
        files.push(arg);
    }
  }

  const file1 = difftool ? (files[0] ?? process.env.LOCAL) : files[0];
  const file2 = difftool ? (files[1] ?? process.env.REMOTE) : files[1];

  if (!file1 || !file2) {
    process.stderr.write(HELP);
    process.exit(1);
  }

  const text1 = readText(file1);
  const text2 = readText(file2);
  const blocks = compare(text1, text2, policy);
  const iterator = new LineBlockTextIterator(text1, text2, blocks);

  if (!iterator.hasChanges()) {
    process.stdout.write('(no differences)\n');
    return;
  }

  const output =
    format === 'side-by-side'
      ? renderSideBySide(iterator, { color })
      : renderInline(iterator, { color });

  process.stdout.write(output);
  if (!output.endsWith('\n')) {
    process.stdout.write('\n');
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(error instanceof Error ? error.message : String(error));
  process.stderr.write('\n');
  process.exit(1);
}
