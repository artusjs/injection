import { setMetadata } from "../util";
import { CLASS_ASYNC_INIT_METHOD } from '../constant';

export function Init(): MethodDecorator {
    return (target: any, property: string | symbol) => {
        target = target.construct ?? target;
        setMetadata(CLASS_ASYNC_INIT_METHOD, { id: target, propertyName: property }, target);
    };
}