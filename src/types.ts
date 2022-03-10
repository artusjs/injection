
export type Constructable<T = unknown> = new (...args: any[]) => T;
export type AbstractConstructable<T> = NewableFunction & { prototype: T };
export type Identifier<T = unknown> = AbstractConstructable<T> | Constructable<T> | string;


export enum ScopeEnum {
    SINGLETON = 'singleton',
    EXECUTION = 'execution',
    TRANSIENT = 'transient'
}

export interface InjectableMetadata<T = any> {
    id: Identifier;
    scope: ScopeEnum;
    properties?: any[];
    constructorArgs?: any[];
    type?: Constructable<T> | null;
    value?: unknown;
    path?: string;
}

export type InjectableOptions = Omit<InjectableMetadata, 'properties' | 'constructorArgs'>;

export interface ReflectMetadataType {
    id: Identifier;
    scope?: ScopeEnum;
    index?: number;
    propertyName?: string | symbol;
}