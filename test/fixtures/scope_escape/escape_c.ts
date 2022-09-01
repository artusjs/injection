import { Inject, Injectable } from '../../../src';
import EscapeD from './escape_d';

@Injectable()
export default class EscapeC {
  private escapeD: EscapeD;

  constructor(@Inject() escapeD: EscapeD) {
    this.escapeD = escapeD;
  }
}
