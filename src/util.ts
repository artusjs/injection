import 'reflect-metadata';

const functionPrototype = Object.getPrototypeOf(Function);

export function getMetadata(metadataKey: string | symbol, target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
        return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.getOwnMetadata(metadataKey, target);
}

export function setMetadata(metadataKey: string | symbol, value: any, target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
        Reflect.defineMetadata(metadataKey, value, target, propertyKey);
    } else {
        Reflect.defineMetadata(metadataKey, value, target);
    }
}


export function recursiveGetMetadata(metadataKey: any, target: any, propertyKey?: string | symbol) {
    const metadatas: any[] = [];
    const metadata = getMetadata(metadataKey, target, propertyKey);
    if (metadata) {
        metadatas.push(metadata);
    }

    let proto = Object.getPrototypeOf(target);
    if (proto !== null && proto !== functionPrototype) {
        const metadata = getMetadata(metadataKey, proto, propertyKey);
        if (metadata) {
            metadatas.push(metadata);
        }
        proto = Object.getPrototypeOf(proto);
    }
    return metadatas;
}