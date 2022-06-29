import { Init, Inject } from '../../../src';
import { AsyncFoo } from './async_foo';

export class Bar {
    // @ts-ignore
    public id: number;

    @Inject()
    foo!: AsyncFoo;

    @Init()
    async init1() {
        this.id = await Promise.resolve(123);
    }
}
