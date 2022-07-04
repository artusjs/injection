import { ReflectMetadataType } from './types';
import { CLASS_TAG } from './constant';
const functionPrototype = Object.getPrototypeOf(Function);

export function getMetadata(metadataKey: string | symbol, target: any, propertyKey?: string | symbol): ReflectMetadataType | ReflectMetadataType[] {
    if (propertyKey) {
        return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.getOwnMetadata(metadataKey, target);
}

export function setMetadata(metadataKey: string | symbol, value: ReflectMetadataType | ReflectMetadataType[], target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
        Reflect.defineMetadata(metadataKey, value, target, propertyKey);
    } else {
        Reflect.defineMetadata(metadataKey, value, target);
    }
}

/**
 * recursive get class and super class metadata
 * @param metadataKey 
 * @param target 
 * @param propertyKey 
 * @returns 
 */
export function recursiveGetMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): ReflectMetadataType[] {
    let metadatas: any[] = [];
    const metadata = getMetadata(metadataKey, target, propertyKey);
    if (metadata) {
        metadatas = metadatas.concat(metadata);
    }

    let proto = Object.getPrototypeOf(target);
    if (proto !== null && proto !== functionPrototype) {
        const metadata = getMetadata(metadataKey, proto, propertyKey);
        if (metadata) {
            metadatas = metadatas.concat(metadata);
        }
        proto = Object.getPrototypeOf(proto);
    }
    return metadatas;
}

/**
 * get constructor parameter types
 * @param clazz 
 * @returns 
 */
export function getParamMetadata(clazz) {
    return Reflect.getMetadata('design:paramtypes', clazz);
}

/**
 * get the property type
 * @param clazz 
 * @param property 
 * @returns 
 */
export function getDesignTypeMetadata(clazz: any, property: string | symbol) {
    return Reflect.getMetadata('design:type', clazz, property);
}

export function addTag(tag: string, target: any) {
    let tags = Reflect.getOwnMetadata(CLASS_TAG, target);
    if (!tags) {
        tags = [];
        Reflect.defineMetadata(CLASS_TAG, tags, target);
    }
    !tags.includes(tag) && tags.push(tag);
}

export function isClass(clazz: any) {
    if (typeof clazz !== 'function') {
        return false;
    }

    const fnStr = Function.prototype.toString.call(clazz);

    return (
        fnStr.substring(0, 5) === 'class' ||
        Boolean(~fnStr.indexOf('classCallCheck(')) ||
        Boolean(
            ~fnStr.indexOf('TypeError("Cannot call a class as a function")')
        )
    );
}

export function isNumber(value) {
    return typeof value === 'number';
}

export function isUndefined(value) {
    return typeof value === 'undefined';
}

export function isObject(value) {
    return typeof value === 'object';
}


export function isPrimitiveFunction(value) {
    return ['String', 'Boolean', 'Number', 'Object'].includes(value.name);
}