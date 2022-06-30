import { Injectable } from "../../../src";

@Injectable()
export default class A {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}