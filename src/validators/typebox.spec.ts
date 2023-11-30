import { describe, it, expect, expectTypeOf, assertType } from 'vitest';
import { Static, Type, type TAnySchema } from '@sinclair/typebox';

import { tbValidator, InferTypeboxValidatorType } from './typebox';
import { ValidationError } from '../helpers/errors';
/**
 * Dummy test
 */

const def = {
  hello: Type.Object({
    field2: Type.Number(),
  }),
  another: Type.String(),
};
type DerivedTypes = InferTypeboxValidatorType<typeof def>;
describe('zod validator', () => {
  it('works', () => {
    const validator = tbValidator(def);

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

    expect(validator('another', 'woorld')).toBe('woorld');
    expect(validator('hello', { field2: 44 })).toStrictEqual({ field2: 44 });
    expect(() => validator('wrong key', 'abracadabra')).toThrowError();
    // bad validation
    expect(() => validator('hello', 'abracadabra')).toThrowError(
      ValidationError
    );
  });

  it.fails('has strict mode', () => {
    const validator = tbValidator(def);

    expect(() =>
      validator('hello', { field2: 44, unknownField: true })
    ).toThrowError();

    // expect(
    //   validator('hello', { field2: 44, unknownField: true })
    // ).toStrictEqual({ field2: 44, unknownField: true });
  });
});
