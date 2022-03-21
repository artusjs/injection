import Container from "./container";
import { ContainerType, Identifier, ReflectMetadataType, ScopeEnum } from "./types";
import { NotFoundError } from "./error/not_found";
import { getMetadata } from "./util";
import { CLASS_ASYNC_INIT_METHOD } from './constant';


export default class ExecutionContainer extends Container {
    private parent: ContainerType;
    private ctx: any;
    constructor(ctx: any, parent: ContainerType) {
        super('execution');
        this.parent = parent;
        this.ctx = ctx;
    }

    public get<T = unknown>(id: Identifier<T>): T {
        const md = this.registry.get(id) ?? this.parent.getDefinition(id);
        if (!md) {
            throw new NotFoundError(id);
        }

        const value = this.getValue(md);
        if (md.scope === ScopeEnum.EXECUTION) {
            md.value = value;
        }
        return value;
    }


    public async getAsync<T = unknown>(id: Identifier<T>): Promise<T> {
        const md = this.registry.get(id) ?? this.parent.getDefinition(id);
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
        if (md.scope === ScopeEnum.EXECUTION) {
            md.value = instance;
        }
        return instance;
    }

    public getCtx(): any {
        return this.ctx;
    }
}