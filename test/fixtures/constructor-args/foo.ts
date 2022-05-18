import { Inject } from '../../../src';

import { Controller } from './controller';

@Controller()
export class Foo {
    constructor(@Inject('config.phone') public id: number) {
        console.log(this.id);
    }
}