import { Inject, Injectable } from '../../../src';
import EscapeB from './escape_b';

@Injectable()
export default class EscapeE {
  b: EscapeB;
  constructor(@Inject() b: EscapeB) {
    this.b = b;
  }
}
