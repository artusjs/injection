import { EXECUTION_CONTEXT_KEY } from './constant';
import Container from './container';
import { ContainerType, HandlerFunction, Identifier, InjectableMetadata, ScopeEnum } from './types';
import { NotFoundError } from './error';

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
    const md = this.getDefinition(id) ?? this.parent.getDefinition(id);
    if (!md) {
      throw new NotFoundError(id);
    }

    const value = this.getValue(md);
    if (md.scope === ScopeEnum.EXECUTION) {
      this.setValue(md, value);
    }
    return value;
  }

  public getCtx(): any {
    return this.ctx;
  }

  public getHandler(name: string | symbol): HandlerFunction | undefined {
    return this.handlerMap.get(name) ?? this.parent.getHandler(name);
  }

  private setValue(md: InjectableMetadata, value: any) {
    if (md.id !== md.type) {
      this.set({
        id: md.type!,
        value,
      });
    }
    this.set({
      id: md.id,
      value,
    });
  }
}
