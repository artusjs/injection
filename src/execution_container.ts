import { EXECUTION_CONTEXT_KEY } from './constant';
import Container from './container';
import { ContainerType, HandlerFunction, Identifier, InjectableMetadata, ScopeEnum } from './types';
import { NotFoundError } from './error';
import { isUndefined } from './util';

export default class ExecutionContainer extends Container {
  private parent: ContainerType;
  private ctx: any;
  constructor(ctx: any, parent: ContainerType) {
    super('execution');
    this.parent = parent;
    this.ctx = ctx;
    this.set({ id: EXECUTION_CONTEXT_KEY, value: ctx });
  }

  public get<T = unknown>(
    id: Identifier<T>,
    options: { noThrow?: boolean; defaultValue?: any } = {}
  ): T {
    const md = this.getDefinition(id) ?? this.parent.getDefinition(id);
    if (!md) {
      if (options.noThrow) {
        return options.defaultValue;
      }
      throw new NotFoundError(id);
    }

    const value = this.getValue(md);
    if (md.scope === ScopeEnum.EXECUTION) {
      this.setValue(md, value);
    }
    return value;
  }

  public getDefinition<T = unknown>(id: Identifier<T>): InjectableMetadata<T> | undefined {
    return super.getDefinition(id) ?? this.parent.getDefinition(id);
  }

  public getInjectableByTag(tag: string): any[] {
    let tags = super.getInjectableByTag(tag);
    if (!tags || tags.length === 0) {
      tags = this.parent.getInjectableByTag(tag);
    }
    return tags;
  }

  public getCtx(): any {
    return this.ctx;
  }

  public getHandler(name: string | symbol): HandlerFunction | undefined {
    return super.getHandler(name) ?? this.parent.getHandler(name);
  }

  private setValue(md: InjectableMetadata, value: any) {
    if (!isUndefined(md.value)) {
      return;
    }

    if (md.type && md.id !== md.type) {
      this.set({
        ...md,
        id: md.type,
        value,
      });
    }
    this.set({
      ...md,
      id: md.id,
      value,
    });
  }
}
