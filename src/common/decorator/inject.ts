import { Identifier } from "../..";
import { setMetadata, getMetadata } from "../../util";
import { CLASS_PROPERTY, CLASS_CONSTRUCTOR_ARGS } from "../constant";

// TODO: 抽离单独的package
export default function inject(id: Identifier): PropertyDecorator | ParameterDecorator {
    return (target: any, propertyKey: string | symbol, index?: number) => {
        target = target.constructor ?? target;
        if (index) {
            const metadata = getMetadata(CLASS_CONSTRUCTOR_ARGS, target) || [];
            metadata.push({ id, index, });
            setMetadata(CLASS_CONSTRUCTOR_ARGS, metadata, target);
            return;
        }

        const metadata = getMetadata(CLASS_PROPERTY, target) || [];
        metadata.push({ id, prop: propertyKey, });
        setMetadata(CLASS_PROPERTY, metadata, target);
    };
}