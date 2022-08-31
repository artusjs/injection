import type Container from './container';
import { ReflectMetadataType } from './types';

export function createLazyProperty(instance: any, md: ReflectMetadataType, container: Container) {
  let init = false;
  let value: any;
  const delayedValue = () => {
    if (!init) {
      value = container.getValueByMetadata(md);
      init = true;
    }
    return value;
  };

  Object.defineProperty(instance, md.propertyName!, {
    get() {
      return delayedValue();
    },
    enumerable: false,
    configurable: true,
  });
}
