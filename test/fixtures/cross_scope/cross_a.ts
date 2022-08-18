import { Inject, Injectable } from '../../../src';
import CrossB from './cross_b';

@Injectable()
export default class CrossA {
  @Inject()
  private crossB!: CrossB;
}
