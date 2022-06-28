import 'reflect-metadata';
import { Container, ExecutionContainer, ScopeEnum, addTag } from '../src';
import { Phone } from './fixtures/class_inject/phone';
import { Person } from './fixtures/class_inject/person';
import { Foo } from './fixtures/constructor_arg/foo';
import { Bar } from './fixtures/async_init/bar';
import { Animal } from './fixtures/class_extend/animal';
import { Cat } from './fixtures/class_extend/cat';
import ExecutionClazzA from './fixtures/execution/a';
import ExecutionClazzB from './fixtures/execution/b';
import { HandlerDemo, CONFIG_ALL } from './fixtures/handler_resolve/handler';

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
        container.set({ id: Bar, scope: ScopeEnum.TRANSIENT });
        container.set({ id: Cat });
        container.set({ id: Animal });
        container.set({ id: 'emptyStr', value: '' });
        container.set({ id: 'nullObj', value: null });

        container.set({ type: ExecutionClazzA });
        container.set({ type: ExecutionClazzB });
    });

    it('should get instance from container', () => {
        const person = container.get(Person);
        expect(person).toBeDefined();
        expect(person.phone).toBeDefined();
        expect(person.phone).toBeInstanceOf(Phone);
        expect(person.email).toBe('artus@artusjs.com');
    });

    it('should get instance with async init method', async () => {
        const bar = await container.getAsync(Bar);
        expect(bar).toBeDefined();
        expect(bar.id).toBe(123);
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

        it('should get instance with async init method', async () => {
          const instanceB = await execContainer.getAsync(ExecutionClazzB);
          const sameInstanceB = await execContainer.getAsync(ExecutionClazzB);
          const sameInstanceBById = await execContainer.getAsync<ExecutionClazzB>('exec_b');

          const anotherExecContainer = new ExecutionContainer(ctx, container);
          const anotherInstanceB = await anotherExecContainer.getAsync(ExecutionClazzB);

          expect(instanceB).toBeDefined();
          expect(sameInstanceB).toBeDefined();
          expect(sameInstanceBById).toBeDefined();
          expect(anotherInstanceB).toBeDefined();

          expect(instanceB.id).toBe(1);
          expect(sameInstanceB.id).toBe(1);
          expect(sameInstanceBById.id).toBe(1);
          expect(anotherInstanceB.id).toBe(2);

          expect(instanceB === sameInstanceB).toBeTruthy();
          expect(instanceB === sameInstanceBById).toBeTruthy();
          expect(instanceB === anotherInstanceB).toBeFalsy();
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
});
