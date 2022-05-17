import { Identifier, ReflectMetadataType } from "../types";
import { setMetadata, getMetadata, isNumber, getDesignTypeMetadata, getParamMetadata, isPrimitiveFunction, isObject, isUndefined } from "../util";
import { CLASS_PROPERTY, CLASS_CONSTRUCTOR_ARGS, INJECT_HANDLER } from "../constant";
import { CannotInjectValueError } from "../error";


export function Inject(id?: Identifier) {
    return (target: any, propertyKey: string | symbol, index?: number) => {
        if (isObject(target)) {
            target = target.constructor;
        }
        let propertyType = id;
        if (!propertyType && propertyKey) {
            propertyType = getDesignTypeMetadata(target.prototype, propertyKey);
        }

        if (!propertyType && isNumber(index)) {
            const paramTypes = getParamMetadata(target);
            propertyType = paramTypes?.[index!];
        }

        if (!propertyType || isPrimitiveFunction(propertyType)) {
            throw new CannotInjectValueError(target, propertyKey);
        }

        const md = getMetadata(INJECT_HANDLER, target, propertyKey ?? index + '') as ReflectMetadataType;

        if (!isUndefined(index)) {
            const metadata = (getMetadata(CLASS_CONSTRUCTOR_ARGS, target) || []) as ReflectMetadataType[];
            metadata.push({ id: propertyType!, index, handler: md?.handler });
            setMetadata(CLASS_CONSTRUCTOR_ARGS, metadata, target);
            return;
        }

        const metadata = (getMetadata(CLASS_PROPERTY, target) || []) as ReflectMetadataType[];
        metadata.push({ id: propertyType!, propertyName: propertyKey, handler: md?.handler });
        setMetadata(CLASS_PROPERTY, metadata, target);
    };
}
