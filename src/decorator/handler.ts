import { INJECT_HANDLER_ARGS, INJECT_HANDLER_PROPS } from '../constant';
import { ReflectMetadataType } from '../types';
import { isUndefined, isObject, setMetadata, getMetadata } from '../util';

export function InjectHandler(handlerName: string | symbol, id) {
    return function (target: any, key: string, index?: number) {
        if (isObject(target)) {
            target = target.constructor;
        }

        if (!isUndefined(index)) {
            const metadatas = (getMetadata(INJECT_HANDLER_ARGS, target) ||
                []) as ReflectMetadataType[];
            metadatas.push({ handler: handlerName, id, index });
            setMetadata(INJECT_HANDLER_ARGS, metadatas, target);
            return;
        }
        const metadatas = (getMetadata(INJECT_HANDLER_PROPS, target) ||
            []) as ReflectMetadataType[];
        metadatas.push({ handler: handlerName, id, propertyName: key });
        setMetadata(INJECT_HANDLER_PROPS, metadatas, target);
    };
}
