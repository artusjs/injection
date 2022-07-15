import { Init } from '../../../src';

export class AsyncFoo {
  public age!: number;

  @Init()
  async init() {
    this.age = await Promise.resolve(4);
  }
}
