import Container from './container';
import { Identifier } from './types';

const reflectMethods: ReadonlyArray<keyof ProxyHandler<any>> = ['get', 'set', 'getPrototypeOf'];

function createHandler<T extends Object>(delayedObject: () => T): ProxyHandler<T> {
  const handler: ProxyHandler<T> = {};
  const install = (name: keyof ProxyHandler<T>) => {
    handler[name] = (...args: any[]) => {
      args[0] = delayedObject();
      const method = Reflect[name];
      return (method as any)(...args);
    };
  };
  reflectMethods.forEach(install);
  return handler;
}

function createProxy<T>(id: Identifier<T>, container: Container): T {
  const target: Record<string, any> = {};
  let init = false;
  let value: T;
  const delayedObject: () => T = (): T => {
    if (!init) {
      value = container.get(id);
      init = true;
    }
    return value;
  };
  return new Proxy<any>(target, createHandler(delayedObject)) as T;
}

export function lazyHandler<T>(id: Identifier<T>, container: Container): T {
  return createProxy(id, container);
}