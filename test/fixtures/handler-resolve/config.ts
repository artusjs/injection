import { INJECT_HANDLER } from '../../../src';

export const CONFIG_ALL = 'all';

export function Config(id?: string) {
    return function (target: any, key: string, index?: number) {
        if (typeof target === 'object') {
            target = target.constructor;
        }
        const metadatas = Reflect.getOwnMetadata(INJECT_HANDLER, target) || [];
        metadatas.push({ handler: 'config', id: id ?? CONFIG_ALL, propertyName: key, index });
        Reflect.defineMetadata(INJECT_HANDLER, metadatas, target);
    }
}