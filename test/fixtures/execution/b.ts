import { Init, Injectable, ScopeEnum } from '../../../src';

let count = 1;

@Injectable({
  id: 'exec_b',
  scope: ScopeEnum.EXECUTION
})
export default class ExecutionClazzB {
  id: number = 0;
  
  constructor() {}

  @Init()
  async init(): Promise<void> {
    return new Promise((resolve, _) => { 
      setTimeout(() => {
        this.id = count++;
        resolve();
      }, 1000);
    });
  }
}