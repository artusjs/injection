import { Identifier, ReflectMetadataType } from "..";
import { setMetadata, getMetadata, isNumber, getDesignTypeMetadata, getParamMetadata } from "../util";
import { CLASS_PROPERTY, CLASS_CONSTRUCTOR_ARGS } from "../constant";

export function inject(id?: Identifier): PropertyDecorator | ParameterDecorator {
    return (target: any, propertyKey: string | symbol, index?: number) => {
        target = target.constructor ?? target;
        let propertyType = id;
        if (!propertyType) {
            propertyType = getDesignTypeMetadata(target.prototype, propertyKey);
        }

        if (!propertyType && isNumber(index)) {
            const paramTypes = getParamMetadata(target);
            propertyType = paramTypes[index!];
        }

        // TODO: custom error
        if (propertyType === undefined || propertyType === Object) {
            throw new Error('can not inject value');
        }
        if (index) {
            const metadata = (getMetadata(CLASS_CONSTRUCTOR_ARGS, target) || []) as ReflectMetadataType[];
            metadata.push({ id: propertyType!, index });
            setMetadata(CLASS_CONSTRUCTOR_ARGS, metadata, target);
            return;
        }

        const metadata = (getMetadata(CLASS_PROPERTY, target) || []) as ReflectMetadataType[];

        metadata.push({ id: propertyType!, prop: propertyKey, });
        setMetadata(CLASS_PROPERTY, metadata, target);
    };
}