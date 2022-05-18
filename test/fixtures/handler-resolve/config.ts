import { Handler } from '../../../src';

export const CONFIG_ALL = 'all';

export function Config(id?: string) {
    return Handler('config', id || CONFIG_ALL);
}