import { Identifier } from "../types";

export class NotFoundError extends Error {
    public name = 'NotFoundError';
    private normalizedIdentifier: string = 'Unknown';

    constructor(identifier: Identifier) {
        super();
        if (typeof identifier === 'string') {
            this.normalizedIdentifier = identifier;
        } else if (identifier?.name) {
            this.normalizedIdentifier = identifier.name;
        }
    }

    get message() {
        return `[@artus/injection] with "${this.normalizedIdentifier}" identifier was not found in the container. `;
    }
}