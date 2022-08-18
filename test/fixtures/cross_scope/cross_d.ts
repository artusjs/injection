import { Injectable, ScopeEnum } from '../../../src';

@Injectable({ scope: ScopeEnum.EXECUTION, allowCrossScope: true })
export default class CrossD {}
