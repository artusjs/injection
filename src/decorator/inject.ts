import { Identifier, ReflectMetadataType } from "..";
import { setMetadata, getMetadata, isNumber, getDesignTypeMetadata, getParamMetadata } from "../util";
import { CLASS_PROPERTY, CLASS_CONSTRUCTOR_ARGS } from "../constant";
import { CannotInjectValueError } from "../error/cannot_inject_value";


export function Inject(id?: Identifier) {
    return (target: any, propertyKey: string | symbol, index?: number) => {
        if (target.constructor !== Function) {
            target = target.constructor;
        }
        let propertyType = id;
        if (!propertyType) {
            propertyType = getDesignTypeMetadata(target.prototype, propertyKey);
        }

        if (!propertyType && isNumber(index)) {
            const paramTypes = getParamMetadata(target);
            propertyType = paramTypes?.[index!];
        }

        if (propertyType === undefined || propertyType === Object) {
            throw new CannotInjectValueError(target, propertyKey);
        }

        if (index) {
            const metadata = (getMetadata(CLASS_CONSTRUCTOR_ARGS, target) || []) as ReflectMetadataType[];
            metadata.push({ id: propertyType!, index });
            setMetadata(CLASS_CONSTRUCTOR_ARGS, metadata, target);
            return;
        }

        const metadata = (getMetadata(CLASS_PROPERTY, target) || []) as ReflectMetadataType[];
        metadata.push({ id: propertyType!, propertyName: propertyKey, });
        setMetadata(CLASS_PROPERTY, metadata, target);
    };
}