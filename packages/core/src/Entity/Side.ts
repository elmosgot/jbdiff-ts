export class Side {
  private static readonly LEFT = 0;
  private static readonly RIGHT = 1;

  private static leftInstance: Side | null = null;
  private static rightInstance: Side | null = null;

  private constructor(private readonly index: number) {}

  static fromIndex(index: number): Side {
    switch (index) {
      case Side.LEFT:
        return Side.left();
      case Side.RIGHT:
        return Side.right();
      default:
        throw new Error(`Invalid index: ${index}`);
    }
  }

  static fromLeft(isLeft: boolean): Side {
    return isLeft ? Side.left() : Side.right();
  }

  static fromRight(isRight: boolean): Side {
    return isRight ? Side.right() : Side.left();
  }

  getIndex(): number {
    return this.index;
  }

  isLeft(): boolean {
    return this.index === Side.LEFT;
  }

  other(other = true): Side {
    if (!other) {
      return this;
    }
    return this.isLeft() ? Side.right() : Side.left();
  }

  select<T>(left: T, right: T): T {
    return this.isLeft() ? left : right;
  }

  private static left(): Side {
    return (Side.leftInstance ??= new Side(Side.LEFT));
  }

  private static right(): Side {
    return (Side.rightInstance ??= new Side(Side.RIGHT));
  }
}
