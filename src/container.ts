import {
    CLASS_CONSTRUCTOR,
    CLASS_PROPERTY,
    CLASS_CONSTRUCTOR_ARGS,
    CLASS_ASYNC_INIT_METHOD,
    CLASS_TAG,
    INJECT_HANDLER_ARGS,
    INJECT_HANDLER_PROPS,
    MAP_TYPE,
} from './constant';
import {
    Constructable,
    ContainerType,
    Identifier,
    InjectableMetadata,
    InjectableDefinition,
    ReflectMetadataType,
    ScopeEnum,
    HandlerFunction,
} from './types';
import {
    getMetadata,
    getParamMetadata,
    isClass,
    isFunction,
    isPrimitiveFunction,
    isUndefined,
    recursiveGetMetadata,
} from './util';

import {
    NotFoundError,
    NoTypeError,
    NoHandlerError,
    NoIdentifierError,
    InjectionError,
} from './error';

export default class Container implements ContainerType {
    private registry: Map<Identifier, InjectableMetadata>;
    private tags: Map<string, Set<any>>;
    // @ts-ignore
    protected name: string;
    protected handlerMap: Map<string | symbol, HandlerFunction>;

    constructor(name: string) {
        this.name = name;
        this.registry = new Map();
        this.tags = new Map();
        this.handlerMap = new Map();
    }

    public get<T = unknown>(id: Identifier<T>): T {
        const md = this.getMetadata(id);
        if (!md) {
            throw new NotFoundError(id);
        }
        return this.getValue(md);
    }

    public async getAsync<T = unknown>(id: Identifier<T>): Promise<T> {
        const md = this.getMetadata(id);
        if (!md) {
            throw new NotFoundError(id);
        }
        const instance = await this.getValueAsync(md);
        await instance[md.initMethod!]?.();
        return instance;
    }

    public set(options: Partial<InjectableDefinition>) {
        if (options.id && !isUndefined(options.value)) {
            const md: InjectableMetadata = {
                id: options.id,
                value: options.value,
                scope: options.scope ?? ScopeEnum.SINGLETON,
            };
            this.registry.set(md.id, md);
            return this;
        }

        const { type, id, scope } = this.getDefinedMetaData(options);
        const md: InjectableMetadata = {
            ...options,
            id,
            type,
            scope,
        };
        if (type) {
            const args = getMetadata(CLASS_CONSTRUCTOR_ARGS, type) as ReflectMetadataType[];
            const props = recursiveGetMetadata(CLASS_PROPERTY, type) as ReflectMetadataType[];
            const initMethodMd = getMetadata(CLASS_ASYNC_INIT_METHOD, type) as ReflectMetadataType;
            const handlerArgs = getMetadata(INJECT_HANDLER_ARGS, type) as ReflectMetadataType[];
            const handlerProps = recursiveGetMetadata(
                INJECT_HANDLER_PROPS,
                type
            ) as ReflectMetadataType[];

            md.constructorArgs = (args ?? []).concat(handlerArgs ?? []);
            md.properties = (props ?? []).concat(handlerProps ?? []);
            md.initMethod = initMethodMd?.propertyName ?? 'init';
            /**
             * compatible with inject type identifier when identifier is string
             */
            if (md.id !== type) {
                md[MAP_TYPE] = type;
                this.registry.set(type, md);
            }

            this.handleTag(type);
        }

        this.registry.set(md.id, md);
        if (md.eager && md.scope !== ScopeEnum.TRANSIENT) {
            // TODO: handle async
            this.get(md.id);
        }

        return this;
    }

    public getDefinition<T = unknown>(id: Identifier<T>): InjectableMetadata<T> | undefined {
        return this.getMetadata(id);
    }

    public getInjectableByTag(tag: string): any[] {
        const result = this.tags.get(tag);
        return result ? [...result] : [];
    }

    public getByTag(tag: string) {
        const clazzes = this.getInjectableByTag(tag);
        return clazzes.map(clazz => this.get(clazz));
    }

    public getByTagAsync(tag: string) {
        const clazzes = this.getInjectableByTag(tag);
        return Promise.all(clazzes.map(clazz => this.getAsync(clazz)));
    }

    public registerHandler(name: string | symbol, handler: HandlerFunction) {
        this.handlerMap.set(name, handler);
    }

    public getHandler(name: string | symbol) {
        return this.handlerMap.get(name);
    }

    public hasValue(options: Partial<InjectableDefinition>): boolean {
        const { id } = this.getDefinedMetaData(options);
        const md = this.getDefinition(id);
        return !!md && !isUndefined(md.value);
    }

    protected getValue(md: InjectableMetadata) {
        if (!isUndefined(md.value)) {
            return md.value;
        }
        let value;
        if (md.factory) {
            value = md.factory(md.id, this);
        }

        if (!value && md.type) {
            const clazz = md.type!;
            const params = this.resolveParams(clazz, md.constructorArgs);
            value = new clazz(...params);
            this.handleProps(value, md.properties ?? []);
        }

        if (md.scope === ScopeEnum.SINGLETON) {
            md.value = value;
        }
        return value;
    }

    protected async getValueAsync(md: InjectableMetadata) {
        if (!isUndefined(md.value)) {
            return md.value;
        }
        let value;
        if (md.factory) {
            value = await md.factory(md.id, this);
        }

        if (!value && md.type) {
            const clazz = md.type!;
            const params = await this.resolveParamsAsync(clazz, md.constructorArgs);
            value = new clazz(...params);
            await this.handlePropsAsync(value, md.properties ?? []);
        }

        if (md.scope === ScopeEnum.SINGLETON) {
            md.value = value;
        }
        return value;
    }

    protected getMetadata(id: Identifier): InjectableMetadata | undefined {
        const md = this.registry.get(id);
        if (md && md[MAP_TYPE]) {
            return this.registry.get(md[MAP_TYPE]);
        }
        return md;
    }

    private getDefinedMetaData(options: Partial<InjectableDefinition>): {
        id: Identifier;
        scope: ScopeEnum;
        type?: Constructable | null;
    } {
        let { type, id, scope = ScopeEnum.SINGLETON, factory } = options;
        if (!type) {
            if (id && isClass(id)) {
                type = id as Constructable;
            }
        }

        if (!type && !factory) {
            throw new NoTypeError(`injectable ${id?.toString()}`);
        }

        if (factory && !isFunction(factory)) {
            throw new InjectionError('factory option must be function');
        }

        if (type) {
            const targetMd = (getMetadata(CLASS_CONSTRUCTOR, type) as ReflectMetadataType) || {};
            id = targetMd.id ?? id ?? type;
            scope = targetMd.scope ?? scope;
        }

        if (!id && factory) {
            throw new NoIdentifierError(`injectable with factory option`);
        }

        return { type, id: id!, scope };
    }

    private resolveParams(clazz: any, args?: ReflectMetadataType[]): any[] {
        const params: any[] = [];
        if (!args || !args.length) {
            args = (getParamMetadata(clazz) ?? []).map((ele, index) => ({
                id: ele,
                index,
            }));
        }

        args!.forEach(arg => {
            if (isPrimitiveFunction(arg.id as any)) {
                return;
            }

            params[arg.index!] = arg.handler
                ? this.resolveHandler(arg.handler, arg.id)
                : this.get(arg.id);
        });
        return params;
    }

    private async resolveParamsAsync(clazz: any, args?: ReflectMetadataType[]) {
        const params: any[] = [];
        if (!args || !args.length) {
            args = (getParamMetadata(clazz) ?? []).map((ele, index) => ({
                id: ele,
                index,
            }));
        }

        await Promise.all(
            args!.map(async arg => {
                if (isPrimitiveFunction(arg.id)) {
                    return;
                }

                params[arg.index!] = arg.handler
                    ? await this.resolveHandler(arg.handler, arg.id)
                    : await this.getAsync(arg.id);
            })
        );
        return params;
    }

    private handleProps(instance: any, props: ReflectMetadataType[]) {
        props.forEach(prop => {
            instance[prop.propertyName!] = prop.handler
                ? this.resolveHandler(prop.handler, prop.id)
                : this.get(prop.id);
        });
    }

    private async handlePropsAsync(instance: any, props: ReflectMetadataType[]) {
        await Promise.all(
            props.map(async prop => {
                instance[prop.propertyName!] = prop.handler
                    ? await this.resolveHandler(prop.handler, prop.id)
                    : await this.getAsync(prop.id);
            })
        );
    }

    private handleTag(target: any) {
        let tags = Reflect.getOwnMetadata(CLASS_TAG, target);
        if (!tags) {
            return;
        }

        if (!Array.isArray(tags)) {
            tags = [tags];
        }
        tags.forEach(tag => {
            if (!this.tags.has(tag)) {
                this.tags.set(tag, new Set());
            }
            this.tags.get(tag)!.add(target);
        });
    }

    private resolveHandler(handlerName: string | symbol, id?: Identifier): any {
        const handler = this.getHandler(handlerName);

        if (!handler) {
            throw new NoHandlerError(handlerName.toString());
        }

        return id ? handler(id, this) : handler(this);
    }
}
