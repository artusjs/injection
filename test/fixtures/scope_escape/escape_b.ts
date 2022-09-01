import { Injectable, ScopeEnum } from '../../../src';

@Injectable({ scope: ScopeEnum.EXECUTION })
export default class EscapeB {}
