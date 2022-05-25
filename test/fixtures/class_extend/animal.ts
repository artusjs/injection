import { Inject } from '../../../src'

export class Animal {
    @Inject('planet')
    //@ts-ignore
    public planet: string;
}