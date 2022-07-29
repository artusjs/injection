import Container from './container';
import { Identifier } from './types';

const reflectMethods: ReadonlyArray<keyof ProxyHandler<any>> = ['get', 'set', 'getPrototypeOf'];

function createHandler(delayedObject: () => any): ProxyHandler<object> {
  const handler: ProxyHandler<object> = {};
  const install = (name: keyof ProxyHandler<any>) => {
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
  const target: object = {};
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