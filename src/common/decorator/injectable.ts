import { Identifier } from "../../types";
import { setMetadata } from '../../util';
import { CLASS_CONSTRUCTOR } from '../constant'


// TODO: 抽离单独的package
export default function injectable(id?: Identifier): ClassDecorator {
    return (target: any) => {
        setMetadata(CLASS_CONSTRUCTOR, { id }, target);
    };
}