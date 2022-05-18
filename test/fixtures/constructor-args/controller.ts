import { CLASS_TAG } from '../../../src'

export function Controller() {
    return function (target) {
        Reflect.defineMetadata(CLASS_TAG, 'controller', target);
    }
}