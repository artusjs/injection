import 'reflect-metadata';
import { Container, ExecutionContainer, ScopeEnum } from '../src';
import { Phone } from './fixtures/class-inject/phone';
import { Person } from './fixtures/class-inject/person';
import { Foo } from './fixtures/constructor-args/foo';
import { Bar } from './fixtures/async-init/bar';
import { Animal } from './fixtures/class-extend/animal';
import { Cat } from './fixtures/class-extend/cat';

const ctx = {};
const container = new Container('default');
const execContainer = new ExecutionContainer(ctx, container);

describe("container", () => {
    beforeAll(() => {
        container.set({ id: 'config.email', value: 'artus@artusjs.com' });
        container.set({ id: 'config.phone', value: '12345678901' });
        container.set({ id: 'planet', value: 'earth' })
        container.set({ type: Phone });
        container.set({ id: Person });
        container.set({ id: Foo, scope: ScopeEnum.EXECUTION });
        container.set({ id: Bar, scope: ScopeEnum.TRANSIENT });
        container.set({ id: Cat });
        container.set({ id: Animal });
    });

    it("should get instance from container", () => {
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

    describe('ExecutionContainer', () => {
        it('should get instance when inject constructor args', () => {
            const foo: Foo = execContainer.get(Foo);
            expect(foo).toBeDefined();
            expect(foo.id).toBe('12345678901');
            const foo2: Foo = execContainer.get(Foo);
            expect(foo === foo2).toBe(true);
        });

        it('should get instance with async init method', async () => {
            const bar = await execContainer.getAsync(Bar);
            expect(bar).toBeDefined();
            expect(bar.id).toBe(123);
        });
    });
});
