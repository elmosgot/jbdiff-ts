export class DiffToBigException extends Error {
  constructor(message = 'Diff too big') {
    super(message);
    this.name = 'DiffToBigException';
  }
}
