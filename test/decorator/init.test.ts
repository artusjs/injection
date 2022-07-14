import { Init, CLASS_ASYNC_INIT_METHOD } from '../../src';
import 'reflect-metadata';


describe('init decorator', () => {
  it('should throw can not inject error', () => {
    class Demo {
      public id!: number;

      @Init()
      init1() {
        this.id = 123;
      }
    }

    const md = Reflect.getOwnMetadata(CLASS_ASYNC_INIT_METHOD, Demo);
    expect(md).toBeDefined();
    expect(md.propertyName).toBe('init1');
  });
});