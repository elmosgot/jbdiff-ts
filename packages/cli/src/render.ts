import { TextPartType, type TextPart } from '@jbdiff/core';

export interface RenderOptions {
  color: boolean;
}

const ANSI = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  dim: '\x1b[2m',
};

function paint(text: string, code: string, color: boolean): string {
  return color ? `${code}${text}${ANSI.reset}` : text;
}

export function renderInline(parts: Iterable<TextPart>, options: RenderOptions): string {
  let out = '';
  for (const [type, text] of parts) {
    switch (type) {
      case TextPartType.REMOVED:
        out += paint(text, ANSI.red, options.color);
        break;
      case TextPartType.ADDED:
        out += paint(text, ANSI.green, options.color);
        break;
      default:
        out += text;
    }
  }
  return out;
}

export function renderSideBySide(parts: Iterable<TextPart>, options: RenderOptions): string {
  const left: string[] = [];
  const right: string[] = [];

  for (const [type, text] of parts) {
    switch (type) {
      case TextPartType.UNCHANGED_BEFORE:
        left.push(text);
        break;
      case TextPartType.UNCHANGED_AFTER:
        right.push(text);
        break;
      case TextPartType.REMOVED:
        left.push(paint(text, ANSI.red, options.color));
        break;
      case TextPartType.ADDED:
        right.push(paint(text, ANSI.green, options.color));
        break;
    }
  }

  const leftText = left.join('');
  const rightText = right.join('');
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  const max = Math.max(leftLines.length, rightLines.length);
  const lines: string[] = [];

  for (let i = 0; i < max; i++) {
    const l = leftLines[i] ?? '';
    const r = rightLines[i] ?? '';
    const width = Math.max(l.replace(/\x1b\[[0-9;]*m/g, '').length, 40);
    const plainL = l.replace(/\x1b\[[0-9;]*m/g, '');
    lines.push(`${paint('−', ANSI.red, options.color)} ${plainL.padEnd(width)}  ${paint('+', ANSI.green, options.color)} ${r}`);
  }

  return lines.join('\n');
}
