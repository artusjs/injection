import { EXECUTION_CONTEXT_KEY } from './constant';
import Container from "./container";
import {
    ContainerType,
    Identifier,
    ScopeEnum,
} from "./types";
import { NotFoundError } from "./errors";

export default class ExecutionContainer extends Container {
    private parent: ContainerType;
    private ctx: any;
    constructor(ctx: any, parent: ContainerType) {
        super('execution');
        this.parent = parent;
        this.ctx = ctx;
        this.set({ id: EXECUTION_CONTEXT_KEY, value: ctx });
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

        await instance[md.initMethod!]?.();
        if (md.scope === ScopeEnum.EXECUTION) {
            md.value = instance;
        }
        return instance;
    }

    public getCtx(): any {
        return this.ctx;
    }
}
