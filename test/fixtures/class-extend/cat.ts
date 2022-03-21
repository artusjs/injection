import { Animal } from "./animal";

export class Cat extends Animal {
    public sayHello() {
        console.log(`I am from ${this.planet}`);
    }
}
