import { Identifier } from "../types";
import { setMetadata } from '../util';
import { CLASS_CONSTRUCTOR } from '../constant'


export function Injectable(id?: Identifier): ClassDecorator {
    return (target: any) => {
        setMetadata(CLASS_CONSTRUCTOR, { id: id ?? target.name }, target);
    };
}