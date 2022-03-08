
export class NoTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoTypeError';
    }

    get message() {
        return ''
    }
}