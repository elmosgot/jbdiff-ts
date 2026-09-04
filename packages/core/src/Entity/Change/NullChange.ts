import { Change } from './Change.js';

export class NullChange extends Change {
  constructor() {
    super(0, 0, 0, 0);
  }

  override isNull(): boolean {
    return true;
  }
}
