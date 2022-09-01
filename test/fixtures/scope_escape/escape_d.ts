import { Injectable, ScopeEnum } from '../../../src';

@Injectable({ scope: ScopeEnum.EXECUTION, scopeEscape: true })
export default class EscapeD {}
