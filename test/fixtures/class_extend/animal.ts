import { Inject } from '../../../src';

export class Animal {
  @Inject('planet')
  public planet!: string;
}