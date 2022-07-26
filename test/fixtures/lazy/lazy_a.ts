import LazyB from './lazy_b';
import { Inject, Injectable } from '../../../src';

@Injectable({ lazy: true })
export default class LazyAClass {
    @Inject()
    lazyB!: LazyB;
}