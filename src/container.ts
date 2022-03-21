
import { CLASS_ASYNC_INIT_METHOD, InjectableOptions, ReflectMetadataType } from ".";
import { Identifier, InjectableMetadata, ScopeEnum, Constructable, ContainerType } from "./types";
import { CLASS_CONSTRUCTOR, CLASS_PROPERTY, CLASS_CONSTRUCTOR_ARGS } from './constant';
import { getMetadata, isClass, recursiveGetMetadata, getParamMetadata, isPrimitiveFunction } from "./util";
import { NotFoundError } from "./error/not_found";
import { NoTypeError } from "./error/no_type";
export default class Container implements ContainerType {

    protected registry: Map<Identifier, InjectableMetadata>;
    // @ts-ignore
    protected name: string;
    constructor(name: string) {
        this.name = name;
        this.registry = new Map();
    }

    public get<T = unknown>(id: Identifier<T>): T {
        const md = this.registry.get(id);
        if (!md) {
            throw new NotFoundError(id);
        }
        return this.getValue(md);
    }

    public async getAsync<T = unknown>(id: Identifier<T>): Promise<T> {
        const md = this.registry.get(id);
        if (!md) {
            throw new NotFoundError(id);
        }
        const instance = this.getValue(md);
        let methodName: string | symbol = 'init';
        if (md.type) {
            const initMd = getMetadata(CLASS_ASYNC_INIT_METHOD, md.type) as ReflectMetadataType;
            methodName = initMd?.propertyName || methodName;
        }
        await instance[methodName]?.();
        return instance;
    }

    public set(options: Partial<InjectableOptions>) {
        let type = options.type;
        if (!type) {
            if (options.id && options.value) {
                const md: InjectableMetadata = { id: options.id, value: options.value, scope: options.scope ?? ScopeEnum.SINGLETON };
                this.registry.set(md.id, md);
                return this;
            }
            if (options.id && isClass(options.id)) {
                type = options.id as Constructable;
            }
        }

        if (!type) {
            throw new NoTypeError('type is required');
        }
        const targetMd = getMetadata(CLASS_CONSTRUCTOR, type) as ReflectMetadataType || {};
        const id = targetMd.id ?? options.id ?? type;
        const scope = targetMd.scope ?? options.scope ?? ScopeEnum.SINGLETON;
        const args = getMetadata(CLASS_CONSTRUCTOR_ARGS, type) as ReflectMetadataType[];
        const props = recursiveGetMetadata(CLASS_PROPERTY, type) as ReflectMetadataType[];
        const md: InjectableMetadata = { ...options, id, type, scope, constructorArgs: args, properties: props };
        this.registry.set(md.id, md);
        return this;
    }

    public getDefinition<T = unknown>(id: Identifier<T>): InjectableMetadata<T> | undefined {
        return this.registry.get(id);
    }

    protected getValue(md: InjectableMetadata) {
        if (md.value) {
            return md.value;
        }
        const clazz = md.type!;
        const params = this.resolveParams(clazz, md.constructorArgs);
        const value = new clazz(...params);
        this.handleProps(value, md.properties ?? []);
        if (md.scope === ScopeEnum.SINGLETON) {
            md.value = value;
        }
        return value;
    }

    private resolveParams(clazz: any, args?: ReflectMetadataType[]): any[] {
        if (!args) {
            args = (getParamMetadata(clazz) ?? []).map((ele, index) => ({ id: ele, index }));
        }
        return args!.map(arg => {
            if (!isPrimitiveFunction((arg.id as any))) {
                return this.get(arg.id);
            }
            return undefined;
        });
    }

    private handleProps(instance: any, props: ReflectMetadataType[]) {
        props.forEach(prop => {
            instance[prop.propertyName!] = this.get(prop.id);
        });
    }
}