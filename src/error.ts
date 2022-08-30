import { Constructable, Identifier } from './types';
import { createErrorClass } from './base_error';

export class CannotInjectValueError extends createErrorClass('CannotInjectValueError') {
  constructor(target: Constructable<unknown>, propertyName: string | symbol) {
    super(
      () =>
        `[@artus/injection] Cannot inject value into "` +
        `${target.name}.${String(propertyName)}". `,
    );
  }
}

export class NoTypeError extends createErrorClass('NoTypeError') {
  constructor(message: string) {
    super(`[@artus/injection] type is required: ${message}`);
  }
}

export class NotFoundError extends createErrorClass('NotFoundError') {
  constructor(identifier: Identifier) {
    const normalizedIdentifier =
      typeof identifier === 'function' ? identifier.name : (identifier ?? 'Unknown').toString();
    super(() => {
      return (
        `[@artus/injection] with "${normalizedIdentifier}" ` +
        `identifier was not found in the container. `
      );
    });
  }
}

export class NoHandlerError extends createErrorClass('NoHandlerError') {
  constructor(handler: string) {
    super(() => {
      return `[@artus/injection] "${handler}" handler was not found in the container.`;
    });
  }
}

export class NoIdentifierError extends createErrorClass('NoIdentifierError') {
  constructor(message: string) {
    super(`[@artus/injection] id is required: ${message}`);
  }
}

export class InjectionError extends createErrorClass('InjectionError') {
  constructor(message: string) {
    super(`[@artus/injection] ${message}`);
  }
}

export class LazyInjectConstructorError extends createErrorClass('LazyInjectConstructor') {
  constructor(name: string) {
    super(`[@artus/injection] cannot inject '${name}' constructor argument by lazy`);
  }
}
