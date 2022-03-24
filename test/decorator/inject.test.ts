import { Inject } from '../../src';
import 'reflect-metadata';


describe('inject decorator', () => {
    it('should throw can not inject error', () => {
        try {
            // @ts-ignore
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
