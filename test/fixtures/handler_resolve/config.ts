import { InjectHandler } from '../../../src';

export const CONFIG_ALL = 'all';

export function Config(id?: string) {
  return InjectHandler('config', id || CONFIG_ALL);
}