import { Injectable, ScopeEnum } from '../../../src';

@Injectable({ id: 'phone', scope: ScopeEnum.SINGLETON })
export class Phone {
  public numbs!: string;
}
