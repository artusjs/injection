import Container from "./container";
import { ContainerType, Identifier, ReflectMetadataType } from "./types";
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

    public get<T = unknown>(id: Identifier): T {
        const md = this.registry.get(id) ?? this.parent.getDefinition(id);
        if (!md) {
            throw new NotFoundError(id);
        }

        return this.getValue(md);
    }


    public async getAsync<T = unknown>(id: Identifier): Promise<T> {
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
        return instance;
    }

    public getCtx(): any {
        return this.ctx;
    }
}