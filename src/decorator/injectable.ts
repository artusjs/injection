import { InjectableOption, ReflectMetadataType, ScopeEnum } from '../types';
import { recursiveGetMetadata, setMetadata } from '../util';
import { CLASS_CONSTRUCTOR, CLASS_PROPERTY, INJECT_HANDLER_PROPS, LAZY_HANDLER } from '../constant';

export function Injectable(options?: InjectableOption): ClassDecorator {
  return (target: any) => {
    const md = { id: target, scope: ScopeEnum.SINGLETON, lazy: false, ...options };
    setMetadata(CLASS_CONSTRUCTOR, md, target);

    // make all properties lazy
    if (md.lazy) {
      const props = recursiveGetMetadata(CLASS_PROPERTY, target) as ReflectMetadataType[];
      const handlerProps = recursiveGetMetadata(
        INJECT_HANDLER_PROPS,
        target,
      ) as ReflectMetadataType[];
      const properties = (props ?? []).concat(handlerProps ?? []);
      properties.forEach(property => property.handler = LAZY_HANDLER);
    }
  };
}