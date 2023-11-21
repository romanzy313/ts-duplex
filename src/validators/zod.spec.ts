import { describe, it, expect, expectTypeOf, assertType } from 'vitest';
import z from 'zod';
import {
  ZodValidatorDefinition,
  zodValidator,
  InferZodValidatorType,
} from './zod';
/**
 * Dummy test
 */

const def = {
  hello: z.object({
    field2: z.number(),
  }),
  another: z.string(),
};
type DerivedTypes = InferZodValidatorType<typeof def>;
describe('zod validator', () => {
  it('works', () => {
    const validator = zodValidator(def);

    // const typeTest: DerivedTypes = {
    //   hello: {
    //     field2: 33,
    //   },
    //   another: 'string',
    // };

    expectTypeOf({} as DerivedTypes).toEqualTypeOf<{
      hello: {
        field2: number;
      };
      another: string;
    }>();

    // assertType<
    //   {} as DerivedTypes
    // >(typeTest);

    expect(validator('another', 'woorld')).toBe('woorld');
    expect(validator('hello', { field2: 44 })).toStrictEqual({ field2: 44 });
    expect(() => validator('wrong key', 'abracadabra')).toThrowError(
      'bad event name'
    );
    // bad validation
    expect(() => validator('hello', 'abracadabra')).toThrowError(z.ZodError);
  });
});
