import { INJECT_HANDLER, Inject } from '../../../src';

export const CONFIG_ALL = 'all';

export function Config(id?: string) {
    return function (target: any, key: string, index?: number) {
        if (typeof target === 'object') {
            target = target.constructor;
        }

        // 需要注册 'config' handler
        Reflect.defineMetadata(INJECT_HANDLER, { handler: 'config' }, target, key ?? index + '');
        Inject(id || CONFIG_ALL)(target, key, index);
    }
}
