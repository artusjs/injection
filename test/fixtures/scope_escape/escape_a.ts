import { Inject, Injectable } from '../../../src';
import EscapeB from './escape_b';

@Injectable()
export default class EscapeA {
  @Inject()
  private escapeB!: EscapeB;
}
