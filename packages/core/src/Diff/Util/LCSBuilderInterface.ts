export interface LCSBuilderInterface {
  addChange(first: number, second: number): void;
  addEqual(length: number): void;
}
