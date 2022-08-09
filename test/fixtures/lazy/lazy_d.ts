import { Injectable } from '../../../src';

@Injectable()
export default class LazyDClass extends Map {
  doSomething() {
    return Array.from(this.entries()).join(',');
  }
}
