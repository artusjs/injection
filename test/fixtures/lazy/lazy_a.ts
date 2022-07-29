import LazyB from './lazy_b';
import { Inject, Injectable } from '../../../src';

@Injectable()
export default class LazyAClass {
  @Inject({ lazy: true })
  lazyB!: LazyB;
}