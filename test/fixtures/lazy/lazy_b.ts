import LazyC from './lazy_c';
import { Inject, Injectable } from '../../../src';

@Injectable()
export default class LazyBClass {
  @Inject({ lazy: true })
  lazyC!: LazyC;
  public name = 'lazyBClass';
}