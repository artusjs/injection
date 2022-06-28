import { Injectable, ScopeEnum } from '../../../src';

let count = 1;

@Injectable({
  id: 'exec_a',
  scope: ScopeEnum.EXECUTION
})
export default class ExecutionClazzA {
  id: number;

  constructor() {
    this.id = count++;
  }
}