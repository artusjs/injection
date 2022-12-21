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
import LazyCClass from './fixtures/lazy/lazy_c';
import LazyBClass from './fixtures/lazy/lazy_b';
import LazyAClass from './fixtures/lazy/lazy_a';
import LazyDClass from './fixtures/lazy/lazy_d';
import LazyWithHandler from './fixtures/lazy/lazy_with_handler';
import Token from './fixtures/class_inject/token';
import EscapeA from './fixtures/scope_escape/escape_a';
import EscapeB from './fixtures/scope_escape/escape_b';
import EscapeC from './fixtures/scope_escape/escape_c';
import EscapeD from './fixtures/scope_escape/escape_d';
import EscapeE from './fixtures/scope_escape/escape_e';

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
    container.set({ id: 'valueId', value: 'token', type: Token });
  });

  it('should get instance from container', () => {
    const person = container.get(Person);
    expect(person).toBeDefined();
    expect(person.phone).toBeDefined();
    expect(person.phone).toBeInstanceOf(Phone);
    expect(person.email).toBe('artus@artusjs.com');
    expect(person.unexist).toBe('unexist');
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

  it('should get value ok by type when register by string id and type', () => {
    const token = container.get('valueId');
    expect(token).toBe('token');
    const token1 = container.get(Token);
    expect(token).toBe(token1);
  });

  it('should get empty value if value is set', () => {
    expect(container.get('emptyStr')).toBe('');
    expect(container.get('nullObj')).toBe(null);
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

    it('should not set value if metadata value exist', () => {
      const execContainer = new ExecutionContainer(ctx, container);
      execContainer.set({ id: 'hasValue', factory: () => 'hello', scope: ScopeEnum.EXECUTION });
      expect(execContainer.get('hasValue')).toBe('hello');
      expect(execContainer.get('hasValue')).toBe('hello');
    });

    it('should get definition from parent', () => {
      const definition = execContainer.getDefinition(Phone);
      expect(definition).toBeDefined();
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
      const childContainer = new ExecutionContainer({}, container);
      container.set({ type: Foo });
      const clazzes = container.getInjectableByTag('controller');
      expect(clazzes.length).toBeGreaterThan(0);
      expect(clazzes[0]).toEqual(Foo);

      const clazzes3 = childContainer.getInjectableByTag('controller');
      expect(clazzes3.length).toBeGreaterThan(0);
      expect(clazzes3[0]).toEqual(Foo);

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
      container.set({ id: 'demo', factory: () => {} });
    }).not.toThrow();
  });
  it('should set not throw error with factory and type', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      container.set({ factory: () => {}, type: Foo });
    }).not.toThrow();
  });

  it('should set throw error with factory and no id', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      container.set({ factory: () => {} });
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
    container.set({ type: LazyDClass });
    expect(instance.lazyB).toBeDefined();
    expect(instance.lazyB).toBeInstanceOf(LazyBClass);
    expect(instance.lazyB === instance.lazyB).toBeTruthy();
    expect(instance.lazyB.name).toBe('lazyBClass');
    expect(instance.lazyB.testLazyD()).toBe('a,b');

    container.set({ type: LazyCClass });
    const instanceb = container.get(LazyBClass);
    expect(instanceb.lazyC).toBeDefined();
    expect(instanceb.lazyC).toBeInstanceOf(LazyCClass);
    expect(instanceb.lazyC === instanceb.lazyC).toBeTruthy();
    expect(instanceb.lazyC.name).toBe('lazyCClass');
  });

  it('should inject property with custom handler OK', () => {
    const container = new Container('lazy_ignore');
    container.set({ type: LazyWithHandler });
    const instance = container.get(LazyWithHandler);
    container.registerHandler('config', id => {
      if (id === CONFIG_ALL) {
        return { name: 'artus' };
      }
      return 'artus';
    });
    expect(instance).toBeDefined();
    expect(instance.config).toEqual({ name: 'artus' });
    expect(instance.name).toBe('artus');
  });

  it('should throw error when inject lazy constructor arg', () => {
    const container = new Container('lazy_constructor');
    try {
      const LazyConstructorClass = require('./fixtures/lazy/constructor_arg').default;
      container.set({ type: LazyConstructorClass });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toContain(
        `[@artus/injection] cannot inject 'LazyConstructorClass' constructor argument by lazy`
      );
    }
  });
});

describe('container#scopeEscape', () => {
  let container;
  beforeAll(() => {
    container = new Container('scope_escape');
    container.set({ id: EscapeA });
    container.set({ id: EscapeB });
    container.set({ id: EscapeC });
    container.set({ id: EscapeD });
    container.set({ id: EscapeE });
  });

  it('should throw error when inject execution scope into single', () => {
    expect(() => {
      container.get(EscapeA);
    }).toThrow(
      `[@artus/injection] 'EscapeA' with 'singleton' scope cannot be injected property 'escapeB' with 'execution' scope`
    );

    expect(() => {
      container.get(EscapeE);
    }).toThrow(
      `[@artus/injection] 'EscapeE' with 'singleton' scope cannot be injected constructor argument at index '0' with 'execution' scope`
    );
  });

  it('should not throw error when inject execution scope into single with scopeEscape true', () => {
    expect(() => {
      const c = container.get(EscapeC);
      expect(c).toBeInstanceOf(EscapeC);
      expect(c.escapeD).toBeInstanceOf(EscapeD);
    }).not.toThrow();
  });
});

describe('container#noThrow', () => {
  let container, execContainer;
  beforeAll(() => {
    container = new Container('no_throw');
    execContainer = new ExecutionContainer({}, container);
  });
  it('should throw error when no find definition with identifier', () => {
    expect(() => {
      container.get(Phone);
    }).toThrowError('identifier was not found in the container');

    expect(() => {
      execContainer.get(Phone);
    }).toThrowError('identifier was not found in the container');
  });

  it('should not throw error when no find definition with identifier', () => {
    expect(() => {
      const phone = new Phone();
      const value = container.get(Phone, { noThrow: true, defaultValue: phone });
      const value2 = execContainer.get(Phone, { noThrow: true, defaultValue: phone });
      expect(value).toBe(phone);
      expect(value2).toBe(phone);
    }).not.toThrowError();
  });
});
