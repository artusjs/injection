
export type Constructable<T> = new (...args: any[]) => T;
export type AbstractConstructable<T> = NewableFunction & { prototype: T };
export type Identifier<T = unknown> = AbstractConstructable<T> | Constructable<T> | string;


export type ContainerScope = 'singleton' | 'execution' | 'transient';

export interface InjectableMetadata<T = unknown> {
    id: Identifier;
    scope: ContainerScope;
    type: Constructable<T> | null;
    value: unknown;
    properties: any[];
    constructorArgs: any[];
    path?: string;
    filename?: string;
    filenameWithoutExt?: string;
}

export type InjectableOptions = Omit<InjectableMetadata, 'properties' | 'constructorArgs'>;

export interface ReflectMetadataType {
    id: Identifier;
    index?: number;
    prop?: string | symbol;
}