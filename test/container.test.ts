import 'reflect-metadata';
import { Container, ExecutionContainer, ScopeEnum, addTag } from '../src';
import { Phone } from './fixtures/class_inject/phone';
import { Person } from './fixtures/class_inject/person';
import { Foo } from './fixtures/constructor_arg/foo';
import { Animal } from './fixtures/class_extend/animal';
import { Cat } from './fixtures/class_extend/cat';
import ExecutionClazzA from './fixtures/execution/a';
import { HandlerDemo, CONFIG_ALL } from './fixtures/handler_resolve/handler';
import ClassA from './fixtures/value/a';
import ClassB from './fixtures/value/b';
import LazyBClass from './fixtures/lazy/lazy_b';
import LazyAClass from './fixtures/lazy/lazy_a';

const ctx = {};
const container = new Container('default');
const execContainer = new ExecutionContainer(ctx, container);

describe('container', () => {
  beforeAll(() => {
    container.set({ id: 'config.email', value: 'artus@artusjs.com' });
    container.set({ id: 'config.phone', value: '12345678901' });
    container.set({ id: 'planet', value: 'earth' });
    container.set({ type: Phone });
    container.set({ id: Person });
    container.set({ id: Foo, scope: ScopeEnum.EXECUTION });
    container.set({ id: Cat });
    container.set({ id: Animal });
    container.set({ id: 'emptyStr', value: '' });
    container.set({ id: 'nullObj', value: null });
    container.set({ type: ExecutionClazzA });
  });

  it('should get instance from container', () => {
    const person = container.get(Person);
    expect(person).toBeDefined();
    expect(person.phone).toBeDefined();
    expect(person.phone).toBeInstanceOf(Phone);
    expect(person.email).toBe('artus@artusjs.com');
  });

  it('should set throw error without value or type or factory', () => {
    expect(() => {
      container.set({ id: 'hello' });
    }).toThrow('type is required');
  });

  it('should inject ok when super class has inject properties', () => {
    const cat = container.get(Cat);
    expect(cat).toBeDefined();
    expect(cat.planet).toBe('earth');
  });

  it('should get instance ok by type when class register by string id', () => {
    const phone = container.get('phone');
    expect(phone).toBeInstanceOf(Phone);

    const phone1 = container.get(Phone);
    expect(phone1).toBeInstanceOf(Phone);

    expect(phone).toBe(phone1);
  });

  it('should get empty value if value is set', () => {
    expect(container.get('emptyStr')).toBe('');
    expect(container.get('nullObj')).toBe(null);
  });

  it('should throw error when no find definition with identifier', () => {
    expect(() => {
      container.get('config.emails');
    }).toThrowError('identifier was not found in the container');
  });

  it('should not throw error when no find definition with identifier', () => {
    expect(() => {
      const value = container.get('config.emails', { noThrow: true, defaultValue: '' });
      expect(value).toBe('');
    }).not.toThrowError();
  });

  describe('ExecutionContainer', () => {
    it('should get instance by execution', () => {
      const instanceA = execContainer.get(ExecutionClazzA);
      const sameInstanceA = execContainer.get(ExecutionClazzA);
      const sameInstanceAById = execContainer.get<ExecutionClazzA>('exec_a');

      const anotherExecContainer = new ExecutionContainer(ctx, container);
      const anotherInstanceA = anotherExecContainer.get(ExecutionClazzA);

      expect(instanceA).toBeDefined();
      expect(sameInstanceA).toBeDefined();
      expect(sameInstanceAById).toBeDefined();
      expect(anotherInstanceA).toBeDefined();

      expect(instanceA.id).toBe(1);
      expect(sameInstanceA.id).toBe(1);
      expect(sameInstanceAById.id).toBe(1);
      expect(anotherInstanceA.id).toBe(2);

      expect(instanceA === sameInstanceA).toBeTruthy();
      expect(instanceA === sameInstanceAById).toBeTruthy();
      expect(instanceA === anotherInstanceA).toBeFalsy();
    });

    it('should throw error when no find definition with identifier', async () => {
      expect(() => {
        execContainer.get('config.emails');
      }).toThrowError('identifier was not found in the container');
    });
  });
});

describe('container#tag', () => {
  beforeAll(() => {
    addTag('controller', Foo);
    addTag('middleware', Foo);
  });

  describe('getInjectableByTag', () => {
    it('should get classes by tag', () => {
      const container = new Container('container#tag');
      container.set({ type: Foo });
      const clazzes = container.getInjectableByTag('controller');
      expect(clazzes.length).toBeGreaterThan(0);
      expect(clazzes[0]).toEqual(Foo);

      const clazzes2 = container.getInjectableByTag('middleware');
      expect(clazzes2.length).toBeGreaterThan(0);
      expect(clazzes2[0]).toEqual(Foo);
    });
  });

  describe('getByTag', () => {
    it('should get instances by tag', () => {
      const container = new Container('container#tag');
      container.set({ type: Foo });
      container.set({ id: 'config.phone', value: '12345678901' });
      const instances = container.getByTag('controller');

      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0]).toBeInstanceOf(Foo);
    });
  });
});

describe('handler', () => {
  beforeAll(() => {
    const config = { id: 1, key1: { val: 3 } };
    container.registerHandler('config', id => {
      if (id === CONFIG_ALL) {
        return config;
      }
      return config[id];
    });
    container.set({ id: HandlerDemo, scope: ScopeEnum.EXECUTION });
  });

  it('should init property ok with handler', () => {
    const handlerDemo = container.get(HandlerDemo);
    expect(handlerDemo.config).toBeDefined();
    expect(handlerDemo.config.key1.val).toBe(3);
    expect(handlerDemo.id).toBe(1);
  });

  it('should init property ok with handler in ExecutionContainer', () => {
    const handlerDemo = execContainer.get(HandlerDemo);
    expect(handlerDemo.config).toBeDefined();
    expect(handlerDemo.config.key1.val).toBe(3);
    expect(handlerDemo.id).toBe(1);
  });

  it('should throw error when no find handler', () => {
    const container = new Container('handler');
    container.set({ id: HandlerDemo, scope: ScopeEnum.EXECUTION });
    try {
      container.get(HandlerDemo);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toMatch('handler was not found in the container');
    }
  });
});

describe('hasValue', () => {
  let container: Container;
  beforeAll(() => {
    container = new Container('value');
  });

  it('container should check value as expected with type', () => {
    expect(container.hasValue({ type: ClassA })).toBeFalsy();
    expect(container.hasValue({ id: ClassA })).toBeFalsy();

    // set { type: clazz }
    container.set({ type: ClassA });
    expect(container.hasValue({ type: ClassA })).toBeFalsy();

    // set { id: clazz }
    container.set({ id: ClassA });
    expect(container.hasValue({ type: ClassA })).toBeFalsy();

    // set { id: clazz, value: value }
    container.set({ id: ClassA, value: new ClassA('foo') });
    expect(container.hasValue({ type: ClassA })).toBeTruthy();
  });

  it('container should check value as expected with id', () => {
    expect(container.hasValue({ type: ClassB })).toBeFalsy();
    expect(container.hasValue({ id: ClassB })).toBeFalsy();

    // set { type: clazz }
    container.set({ type: ClassA });
    expect(container.hasValue({ id: ClassA })).toBeFalsy();

    // set { id: clazz }
    container.set({ id: ClassA });
    expect(container.hasValue({ id: ClassA })).toBeFalsy();

    // set { id: clazz, value: value }
    container.set({ id: ClassA, value: new ClassA('foo') });
    expect(container.hasValue({ id: ClassA })).toBeTruthy();
  });
});

describe('container#factory', () => {
  let container: Container;
  beforeAll(() => {
    container = new Container('factory');
  });

  it('should set not throw error with factory and no type', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      container.set({ id: 'demo', factory: () => { } });
    }).not.toThrow();
  });
  it('should set not throw error with factory and type', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      container.set({ factory: () => { }, type: Foo });
    }).not.toThrow();
  });

  it('should set throw error with factory and no id', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      container.set({ factory: () => { } });
    }).toThrow('id is required');
  });

  it('should set throw error when factory is not function', () => {
    expect(() => {
      container.set({ factory: {} as any, id: 'noFunction' });
    }).toThrow('factory option must be function');
  });

  it('should use factory instance', () => {
    container.set({
      id: 'hello',
      factory: () => {
        return 'world';
      },
    });
    expect(container.get('hello')).toBe('world');
  });

  it('should priority use factory when factory and type all provide', () => {
    container.set({ factory: () => ({ hello: 'world' }), type: Phone });
    const phone = container.get(Phone);
    expect(phone).toEqual({ hello: 'world' });
    expect(phone).not.toBeInstanceOf(Phone);
  });
});

describe('container#lazy', () => {
  it('should get instance ok', () => {
    const container = new Container('lazy');
    container.set({ type: LazyAClass });
    const instance = container.get(LazyAClass);
    expect(instance).toBeInstanceOf(LazyAClass);
    container.set({ type: LazyBClass });
    expect(instance.lazyB).toBeDefined();
    expect(instance.lazyB).toBeInstanceOf(LazyBClass);
    expect(instance.lazyB === instance.lazyB).toBeTruthy();
  });
});