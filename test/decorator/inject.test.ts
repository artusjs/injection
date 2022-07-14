import { Inject } from '../../src';
import 'reflect-metadata';


describe('inject decorator', () => {
  it('should throw can not inject error', () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Demo {
        constructor(@Inject() public id: number) {
        }
      }
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toContain('[@artus/injection] Cannot inject value into');
    }

  });
});
