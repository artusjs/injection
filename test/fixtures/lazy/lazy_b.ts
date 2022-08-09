import LazyC from './lazy_c';
import LazyD from './lazy_d';
import { Inject, Injectable } from '../../../src';

@Injectable()
export default class LazyBClass {
  @Inject({ lazy: true })
  lazyC!: LazyC;

  @Inject({ lazy: true })
  lazyD!: LazyD;

  public name = 'lazyBClass';

  testLazyD() {
    this.lazyD.set('a', 'b');
    return this.lazyD.doSomething();
  }
}
