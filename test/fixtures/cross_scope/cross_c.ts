import { Inject, Injectable } from '../../../src';
import CrossD from './cross_d';

@Injectable()
export default class CrossC {
  private crossD: CrossD;

  constructor(@Inject() crossD: CrossD) {
    this.crossD = crossD;
  }
}
