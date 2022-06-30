import { Injectable } from "../../../src";

@Injectable({ id: 'classb' })
export default class B {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}