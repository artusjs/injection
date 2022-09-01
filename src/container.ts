import {
  CLASS_CONSTRUCTOR,
  CLASS_PROPERTY,
  CLASS_CONSTRUCTOR_ARGS,
  CLASS_TAG,
  INJECT_HANDLER_ARGS,
  INJECT_HANDLER_PROPS,
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
  ScopeEscapeError,
} from './error';
import { createLazyProperty } from './lazy_helper';

export default class Container implements ContainerType {
  private registry: Map<Identifier, InjectableMetadata>;
  private tags: Map<string, Set<any>>;

  protected name: string;
  protected handlerMap: Map<string | symbol, HandlerFunction>;

  constructor(name: string) {
    this.name = name;
    this.registry = new Map();
    this.tags = new Map();
    this.handlerMap = new Map();
  }

  public get<T = unknown>(
    id: Identifier<T>,
    options: { noThrow?: boolean; defaultValue?: any } = {},
  ): T {
    const md = this.getDefinition(id);
    if (!md) {
      if (options.noThrow) {
        return options.defaultValue;
      }
      throw new NotFoundError(id);
    }
    return this.getValue(md);
  }

  public set(options: Partial<InjectableDefinition>) {
    if (options.id && !isUndefined(options.value)) {
      const md: InjectableMetadata = {
        id: options.id,
        value: options.value,
        scope: options.scope ?? ScopeEnum.SINGLETON,
        type: options.type,
      };
      this.registry.set(md.id, md);
      /**
       * compatible with inject type identifier when identifier is string
       */
      if (md.type && isClass(md.type) && md.id !== md.type) {
        this.registry.set(md.type, md);
      }
      return this;
    }

    const { type, id, scope, scopeEscape } = this.getDefinedMetaData(options);
    const md: InjectableMetadata = {
      ...options,
      id,
      type,
      scope,
      scopeEscape,
    };
    if (type) {
      const args = getMetadata(CLASS_CONSTRUCTOR_ARGS, type) as ReflectMetadataType[];
      const props = recursiveGetMetadata(CLASS_PROPERTY, type) as ReflectMetadataType[];
      const handlerArgs = getMetadata(INJECT_HANDLER_ARGS, type) as ReflectMetadataType[];
      const handlerProps = recursiveGetMetadata(
        INJECT_HANDLER_PROPS,
        type,
      ) as ReflectMetadataType[];

      md.constructorArgs = (args ?? []).concat(handlerArgs ?? []);
      md.properties = (props ?? []).concat(handlerProps ?? []);
      /**
       * compatible with inject type identifier when identifier is string
       */
      if (md.id !== type) {
        this.registry.set(type, md);
      }

      this.handleTag(type);
    }

    this.registry.set(md.id, md);
    if (md.eager && md.scope !== ScopeEnum.TRANSIENT) {
      this.get(md.id);
    }

    return this;
  }

  public getDefinition<T = unknown>(id: Identifier<T>): InjectableMetadata<T> | undefined {
    return this.registry.get(id);
  }

  public getInjectableByTag(tag: string): any[] {
    const result = this.tags.get(tag);
    return result ? [...result] : [];
  }

  public getByTag(tag: string) {
    const clazzes = this.getInjectableByTag(tag);
    return clazzes.map(clazz => this.get(clazz));
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

  public getValueByMetadata(md: ReflectMetadataType) {
    if (md.handler) {
      return this.resolveHandler(md.handler, md.id);
    }
    return this.get(md.id, {
      noThrow: md.noThrow,
      defaultValue: md.defaultValue,
    });
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
      const params = this.resolveParams(clazz, md);
      value = new clazz(...params);
      this.resolveProps(value, md);
    }

    if (md.scope === ScopeEnum.SINGLETON) {
      md.value = value;
    }
    return value;
  }

  private getDefinedMetaData(options: Partial<InjectableDefinition>): {
    id: Identifier;
    scope: ScopeEnum;
    type?: Constructable | null;
    scopeEscape?: boolean;
  } {
    let { type, id, scope = ScopeEnum.SINGLETON, factory, scopeEscape } = options;
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
      scopeEscape = targetMd.scopeEscape ?? scopeEscape;
    }

    if (!id && factory) {
      throw new NoIdentifierError(`injectable with factory option`);
    }

    return { type, id: id!, scope, scopeEscape };
  }

  private resolveParams(clazz: any, md: InjectableMetadata): any[] {
    let { constructorArgs: args = [] } = md;
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
      if (!arg.handler) {
        this.checkScope(md, arg.id, arg.index!);
      }

      params[arg.index!] = this.getValueByMetadata(arg);
    });
    return params;
  }

  private resolveProps(instance: any, md: InjectableMetadata) {
    const { properties = [] } = md;
    properties.forEach(prop => {
      if (!prop.handler) {
        this.checkScope(md, prop.id, prop.propertyName!);
      }
      if (prop.lazy) {
        return createLazyProperty(instance, prop, this);
      }
      instance[prop.propertyName!] = this.getValueByMetadata(prop);
    });
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

  /**
   * check rule
   * The first column is the class scope and the first row is the property scope
   * ----------------------------------------
   *          |singleton|execution |transient
   * ----------------------------------------
   * singleton|✅        |❌        |✅
   * ----------------------------------------
   * execution|✅        |✅        |✅
   * ----------------------------------------
   * transient|✅        |❓        |✅
   * ----------------------------------------
   */
  private checkScope(
    metadata: InjectableMetadata,
    id: Identifier,
    propertyOrIndex: string | symbol | number,
  ) {
    const { scope } = metadata;
    if (scope === ScopeEnum.EXECUTION || scope === ScopeEnum.TRANSIENT) {
      return;
    }

    const propMetadata = this.getDefinition(id);

    if (propMetadata?.scope === ScopeEnum.EXECUTION && !propMetadata.scopeEscape) {
      throw new ScopeEscapeError(metadata.type!, propertyOrIndex, scope, propMetadata.scope);
    }
  }
}
