import { Inject } from '../../../src';
import LazyC from './lazy_c';

export default class LazyConstructorClass {
  private c: LazyC;
  constructor(@Inject({ lazy: true }) c: LazyC) {
    this.c = c;
  }
}
