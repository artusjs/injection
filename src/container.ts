
import { InjectableOptions } from ".";
import { Identifier, InjectableMetadata } from "./types";
export default class Container {

    private registry: Map<Identifier, InjectableMetadata>;
    constructor() {
        this.registry = new Map();
    }

    get(id: Identifier): any {

        return {};
    }

    async getAsync(id: Identifier) {
        const instance = this.get(id);
        await instance.init();
        return instance;
    }

    set(options: InjectableOptions) {
        const md: InjectableMetadata = { ...options, constructorArgs: [], properties: [] };
        this.registry.set(options.id, md);
    }
}