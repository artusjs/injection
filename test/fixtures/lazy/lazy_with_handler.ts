import { Injectable } from '../../../src';
import { Config } from '../handler_resolve/config';

@Injectable({ lazy: true })
export default class LazyWithHandlerClass {
  @Config()
  config!: Record<string, any>;

  @Config('name')
  name!: string;
}
