import { Constructable } from "../types";

export class CannotInjectValueError extends Error {
    public name = 'CannotInjectValueError';

    get message(): string {
        return (
            `[@artus/injection] Cannot inject value into "${this.target.name}.${String(this.propertyName)}". `
        );
    }

    constructor(private target: Constructable<unknown>, private propertyName: string | symbol) {
        super();
    }
}
