import { Init } from '../../../src'

export class Bar {
    // @ts-ignore
    public id: number;

    @Init()
    async init1() {
        this.id = await Promise.resolve(123);
    }
}