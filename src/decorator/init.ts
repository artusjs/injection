import { setMetadata, isObject } from '../util';
import { CLASS_ASYNC_INIT_METHOD } from '../constant';

export function Init(): MethodDecorator {
    return (target: any, property: string | symbol) => {
        if (isObject(target)) {
            target = target.constructor;
        }
        setMetadata(CLASS_ASYNC_INIT_METHOD, { id: target, propertyName: property }, target);
    };
}