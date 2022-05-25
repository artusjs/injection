
import { Inject, Injectable } from '../../../src';
import { Phone } from './phone';


@Injectable()
export class Person {

    @Inject()
    // @ts-ignore
    public phone: Phone;

    @Inject('config.email')
    //@ts-ignore
    public email: string;

    sayHello() {
        console.log(this.phone.numbs, this.email);
    }
}

