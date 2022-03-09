
import 'reflect-metadata';
import { Container } from '../src';
import { Phone } from './fixtures/class-inject/phone';
import { Person } from './fixtures/class-inject/person';

const container = new Container('default');
describe("container", () => {
    beforeAll(() => {
        container.set({ id: Phone });
        container.set({ id: Person });
        container.set({ id: 'config.email', value: 'artus@artusjs.com' })
    });
    it("should get instance from container", () => {
        const person = container.get(Person);
        expect(person).toBeDefined();
        expect(person.phone).toBeDefined();
        expect(person.phone).toBeInstanceOf(Phone);
        expect(person.email).toBe('artus@artusjs.com');
    });
});