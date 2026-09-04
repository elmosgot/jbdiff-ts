import { TextPartType, type TextPart } from '@jbdiff/core';

export interface RenderOptions {
  color: boolean;
}

const ANSI = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
};

type SegmentKind = 'unchanged' | 'removed' | 'added';
type Segment = { kind: SegmentKind; text: string };
type Row = { left: Segment[]; right: Segment[] };

function paint(text: string, code: string, color: boolean): string {
  return color ? `${code}${text}${ANSI.reset}` : text;
}

function visibleLength(text: string): number {
  return text.replace(/\x1b\[[0-9;]*m/g, '').length;
}

function paintSegment(segment: Segment, options: RenderOptions): string {
  switch (segment.kind) {
    case 'removed':
      return paint(segment.text, ANSI.red, options.color);
    case 'added':
      return paint(segment.text, ANSI.green, options.color);
    default:
      return segment.text;
  }
}

function renderRowSegments(segments: Segment[], options: RenderOptions): string {
  return segments.map((segment) => paintSegment(segment, options)).join('');
}

class SideBySideBuilder {
  readonly rows: Row[] = [{ left: [], right: [] }];

  private current(): Row {
    return this.rows[this.rows.length - 1]!;
  }

  private newRow(): void {
    this.rows.push({ left: [], right: [] });
  }

  private appendLineToSide(
    side: 'left' | 'right',
    kind: SegmentKind,
    line: string,
  ): void {
    if (line === '') {
      return;
    }

    this.current()[side].push({ kind, text: line });
  }

  /**
   * BEFORE/AFTER unchanged spans can differ in leading newlines under trim policy.
   * Zip-splitting by index misaligns rows; skip unmatched empty lines on either side.
   */
  private appendAlignedLinePairs(
    leftText: string,
    rightText: string,
    leftKind: SegmentKind,
    rightKind: SegmentKind,
  ): void {
    if (leftText === rightText) {
      for (const [index, line] of leftText.split('\n').entries()) {
        if (index > 0) {
          this.newRow();
        }
        this.appendLineToSide('left', leftKind, line);
        this.appendLineToSide('right', rightKind, line);
      }
      return;
    }

    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    let leftIndex = 0;
    let rightIndex = 0;
    let started = false;

    while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
      if (leftIndex >= leftLines.length) {
        if (started) {
          this.newRow();
        }
        this.appendLineToSide('right', rightKind, rightLines[rightIndex] ?? '');
        rightIndex++;
        started = true;
        continue;
      }

      if (rightIndex >= rightLines.length) {
        if (started) {
          this.newRow();
        }
        this.appendLineToSide('left', leftKind, leftLines[leftIndex] ?? '');
        leftIndex++;
        started = true;
        continue;
      }

      const leftLine = leftLines[leftIndex]!;
      const rightLine = rightLines[rightIndex]!;

      if (leftLine === '' && rightLine !== '') {
        leftIndex++;
        continue;
      }

      if (rightLine === '' && leftLine !== '') {
        rightIndex++;
        continue;
      }

      if (leftLine === '' && rightLine === '') {
        leftIndex++;
        rightIndex++;
        continue;
      }

      if (started) {
        this.newRow();
      }

      this.appendLineToSide('left', leftKind, leftLine);
      this.appendLineToSide('right', rightKind, rightLine);
      leftIndex++;
      rightIndex++;
      started = true;
    }
  }

  appendUnchangedPair(leftText: string, rightText: string): void {
    const current = this.current();
    if (
      current.left.some((segment) => segment.kind === 'removed') ||
      current.right.some((segment) => segment.kind === 'added')
    ) {
      this.newRow();
    }

    this.appendAlignedLinePairs(leftText, rightText, 'unchanged', 'unchanged');
  }

  appendChangePair(removed: string, added: string): void {
    const leftLines = removed.split('\n');
    const rightLines = added.split('\n');
    const firstAddedLine = rightLines[0] ?? '';
    const rowHasContent = this.current().left.length > 0 || this.current().right.length > 0;
    const isSameLineSuffix = (line: string) => line === '' || /^[, \t]*$/.test(line);

    if (rowHasContent && !isSameLineSuffix(firstAddedLine)) {
      this.newRow();
    }

    const lineCount = Math.max(leftLines.length, rightLines.length);

    for (let index = 0; index < lineCount; index++) {
      if (index > 0) {
        this.newRow();
      }

      const leftLine = leftLines[index] ?? '';
      const rightLine = rightLines[index] ?? '';

      if (leftLine !== '') {
        this.current().left.push({ kind: 'removed', text: leftLine });
      }
      if (rightLine !== '') {
        this.current().right.push({ kind: 'added', text: rightLine });
      }
    }
  }
}

export function buildSideBySideRows(parts: Iterable<TextPart>): Row[] {
  const builder = new SideBySideBuilder();
  let pendingBefore: string | null = null;
  let pendingRemoved: string | null = null;

  for (const [type, text] of parts) {
    switch (type) {
      case TextPartType.UNCHANGED_BEFORE:
        pendingBefore = text;
        break;
      case TextPartType.UNCHANGED_AFTER:
        builder.appendUnchangedPair(pendingBefore ?? '', text);
        pendingBefore = null;
        break;
      case TextPartType.REMOVED:
        pendingRemoved = text;
        break;
      case TextPartType.ADDED:
        builder.appendChangePair(pendingRemoved ?? '', text);
        pendingRemoved = null;
        break;
    }
  }

  return builder.rows.filter((row) => row.left.length > 0 || row.right.length > 0);
}

export function renderInline(parts: Iterable<TextPart>, options: RenderOptions): string {
  let out = '';
  for (const [type, text] of parts) {
    switch (type) {
      case TextPartType.UNCHANGED_BEFORE:
        // Inline shows the modified file; unchanged context comes from AFTER (text2).
        break;
      case TextPartType.UNCHANGED_AFTER:
        out += text;
        break;
      case TextPartType.REMOVED:
        out += paint(text, ANSI.red, options.color);
        break;
      case TextPartType.ADDED:
        out += paint(text, ANSI.green, options.color);
        break;
    }
  }
  return out;
}

export function renderSideBySide(parts: Iterable<TextPart>, options: RenderOptions): string {
  const rows = buildSideBySideRows(parts);
  const minWidth = 40;
  let maxLeftWidth = minWidth;

  const renderedRows = rows.map((row) => {
    const leftText = renderRowSegments(row.left, options);
    maxLeftWidth = Math.max(maxLeftWidth, visibleLength(leftText));
    return {
      row,
      leftText,
      rightText: renderRowSegments(row.right, options),
    };
  });

  return renderedRows
    .map(({ row, leftText, rightText }) => {
      const leftGutter = row.left.some((segment) => segment.kind === 'removed') ? '−' : ' ';
      const rightGutter = row.right.some((segment) => segment.kind === 'added') ? '+' : ' ';
      const paddedLeft = leftText + ' '.repeat(Math.max(0, maxLeftWidth - visibleLength(leftText)));

      return `${leftGutter} ${paddedLeft}  ${rightGutter} ${rightText}`;
    })
    .join('\n');
}
