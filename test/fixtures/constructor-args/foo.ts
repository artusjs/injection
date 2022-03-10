import { Inject } from '../../../src';

export class Foo {
    constructor(@Inject() private id: number) {
        console.log(this.id);
    }
}