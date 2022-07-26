
import { Inject, Injectable } from '../../../src';
import { Phone } from './phone';


@Injectable()
export class Person {

  @Inject()
  public phone!: Phone;

  @Inject('config.email')
  public email!: string;

  @Inject('unexist', { noThrow: true, defaultValue: 'unexist' })
  public unexist!: string;

  sayHello() {
    console.log(this.phone.numbs, this.email);
  }
}

