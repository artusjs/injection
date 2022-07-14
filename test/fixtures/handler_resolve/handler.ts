
import { Config } from './config';

export { CONFIG_ALL } from './config';

export class HandlerDemo {
  @Config()
    config: Record<string, any>;

  id: string;

  constructor(@Config('id') id: string) {
    this.id = id;
  }
}