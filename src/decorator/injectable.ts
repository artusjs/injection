import { InjectableOption, ScopeEnum } from '../types';
import { setMetadata } from '../util';
import { CLASS_CONSTRUCTOR } from '../constant';

export function Injectable(options?: InjectableOption): ClassDecorator {
  return (target: any) => {
    setMetadata(CLASS_CONSTRUCTOR, { id: target, scope: ScopeEnum.SINGLETON, ...options }, target);
  };
}