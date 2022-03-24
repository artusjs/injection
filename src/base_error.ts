interface InjectionError extends Error {
    readonly name: string;
    readonly message: string;
}

export function createErrorClass(name: string) {
    const Clz = class extends Error implements InjectionError {
        constructor(message: string | (() => string)) {
            super();
            Object.defineProperty(this, 'message', {
                get: typeof message === 'function' ?
                    message :
                    () => message,
            });
        }

        get message(): string {
            return 'To be override.';
        }

        get name(): string {
            return name;
        }
    };

    return Clz;
}
