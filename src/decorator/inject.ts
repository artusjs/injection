import { InjectOptions, Identifier, ReflectMetadataType } from '../types';
import {
  setMetadata,
  getMetadata,
  isNumber,
  getDesignTypeMetadata,
  getParamMetadata,
  isPrimitiveFunction,
  isObject,
  isUndefined,
} from '../util';
import { CLASS_PROPERTY, CLASS_CONSTRUCTOR_ARGS, LAZY_HANDLER } from '../constant';
import { CannotInjectValueError } from '../error';

export function Inject(id?: Identifier);
export function Inject(options?: InjectOptions);
export function Inject(idOrOptions?: Identifier | InjectOptions) {
  const options = (isObject(idOrOptions) ? idOrOptions : { id: idOrOptions }) as InjectOptions;
  return (target: any, propertyKey: string | symbol, index?: number) => {
    if (isObject(target)) {
      target = target.constructor;
    }
    let propertyType = options.id;
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

    if (!isUndefined(index)) {
      const metadata = (getMetadata(CLASS_CONSTRUCTOR_ARGS, target) || []) as ReflectMetadataType[];
      metadata.push({
        ...options,
        id: propertyType!,
        index,
        handler: options.lazy ? LAZY_HANDLER : undefined,
      });
      setMetadata(CLASS_CONSTRUCTOR_ARGS, metadata, target);
      return;
    }

    const metadata = (getMetadata(CLASS_PROPERTY, target) || []) as ReflectMetadataType[];
    metadata.push({
      ...options,
      id: propertyType!,
      propertyName: propertyKey,
      handler: options.lazy ? LAZY_HANDLER : undefined,
    });
    setMetadata(CLASS_PROPERTY, metadata, target);
  };
}
