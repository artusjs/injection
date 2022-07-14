import { InjectableOption, ScopeEnum } from '../types';
import { setMetadata } from '../util';
import { CLASS_CONSTRUCTOR } from '../constant';

export function Injectable(options?: InjectableOption): ClassDecorator {
  return (target: any) => {
    setMetadata(CLASS_CONSTRUCTOR, { id: options?.id || target, scope: options?.scope ?? ScopeEnum.SINGLETON }, target);
  };
}