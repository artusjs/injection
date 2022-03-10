
export class NoTypeError extends Error {
    public name: string;
    constructor(message: string) {
        super(message);
        this.name = 'NoTypeError';
    }

    get message() {
        return '[@artus/injection] type is required';
    }
}