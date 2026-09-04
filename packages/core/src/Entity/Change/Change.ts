export class Change {
  link: Change | null = null;

  constructor(
    public readonly line0: number,
    public readonly line1: number,
    public readonly deleted: number,
    public readonly inserted: number,
    link: Change | null = null,
  ) {
    this.link = link;
  }

  isNull(): boolean {
    return false;
  }

  toString(): string {
    return `change[inserted=${this.inserted}, deleted=${this.deleted}, line0=${this.line0}, line1=${this.line1}]`;
  }

  toArray(): Change[] {
    const result: Change[] = [];
    for (let current: Change | null = this; current !== null; current = current.link) {
      result.push(current);
    }
    return result;
  }
}
