import { Constructable, Identifier } from './types';
import { createErrorClass } from './base_error';

export class CannotInjectValueError extends createErrorClass('CannotInjectValueError') {
  constructor(target: Constructable<unknown>, propertyOrIndex: string | symbol | number) {
    super(() => {
      let message = `'${target.name}.${String(propertyOrIndex)}'`;
      if (typeof propertyOrIndex === 'number') {
        message = `'${target.name}' constructor argument at index '${propertyOrIndex}'`;
      }
      return `[@artus/injection] Cannot inject value into ${message}, maybe inject identifier is undefined or type is primitive type`;
    });
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

export class ScopeEscapeError extends createErrorClass('ScopeEscapeError') {
  constructor(
    target: Constructable<unknown>,
    propertyOrIndex: string | symbol | number,
    classScope: string,
    propScope: string,
  ) {
    super(() => {
      let message = `property '${String(propertyOrIndex)}'`;
      if (typeof propertyOrIndex === 'number') {
        message = `constructor argument at index '${propertyOrIndex}'`;
      }

      return `[@artus/injection] '${target.name}' with '${classScope}' scope cannot be injected ${message} with '${propScope}' scope`;
    });
  }
}
