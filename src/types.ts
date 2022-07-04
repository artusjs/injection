export type Constructable<T = unknown> = new (...args: any[]) => T;
export type AbstractConstructable<T> = NewableFunction & { prototype: T };
export type Identifier<T = unknown> = AbstractConstructable<T> | Constructable<T> | string | symbol;

export enum ScopeEnum {
    SINGLETON = 'singleton',
    EXECUTION = 'execution',
    TRANSIENT = 'transient',
}

export interface InjectableOption {
    id?: Identifier;
    scope?: ScopeEnum;
}

export interface InjectableDefinition<T = unknown> {
    id: Identifier;
    scope: ScopeEnum;
    type?: Constructable<T> | null;
    value?: unknown;
    path?: string;
    /**
     * Indicates whether a new instance should be created as soon as the class is registered.
     * By default the registered classes are only instantiated when they are requested from the container.
     */
    eager?: boolean;
    factory?: CallableFunction;
}

export interface InjectableMetadata<T = any> extends InjectableDefinition<T> {
    properties?: any[];
    constructorArgs?: any[];
    initMethod?: string | symbol;
}

export interface ReflectMetadataType {
    id: Identifier;
    scope?: ScopeEnum;
    index?: number;
    propertyName?: string | symbol;
    handler?: string | symbol;
}

export interface ContainerType {
    get<T>(id: Identifier<T>): T;
    getAsync<T>(id: Identifier<T>): Promise<T>;
    set(options: Partial<InjectableDefinition>): this;
    getDefinition(id: Identifier): InjectableMetadata | undefined;
    getInjectableByTag(tag: string): any[];
    getByTag(tag: string): any[];
    registerHandler(name: string, handler: HandlerFunction): void;
    getHandler(name: string): HandlerFunction | undefined;
}

/**
 * A function that is used to handle a property
 * last parameter is the instance of the Container
 */
export type HandlerFunction = CallableFunction;
