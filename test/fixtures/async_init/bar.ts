import { Init, Inject } from '../../../src';
import { AsyncFoo } from './async_foo';

export class Bar {
  public id!: number;

  @Inject()
    foo!: AsyncFoo;

  @Init()
  async init1() {
    this.id = await Promise.resolve(123);
  }
}
