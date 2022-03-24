import { Inject } from '../../../src';



export class Foo {
    constructor(@Inject('config.phone') public id: number) {
        console.log(this.id);
    }
}