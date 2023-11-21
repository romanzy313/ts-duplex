import { ValidatorFn } from '../types';
import z from 'zod';

export type ZodValidatorDefinition = Record<string, z.ZodSchema>;

export type InferZodValidatorType<T extends ZodValidatorDefinition> = {
  [Key in keyof T]: z.output<T[Key]>;
};

export function zodValidator(def: ZodValidatorDefinition): ValidatorFn {
  return (key, data) => {
    if (!(key in def)) {
      throw new Error('bad event name');
    }

    const validator = def[key];

    return validator.parse(data);
  };
}

// dont specify the type so that it works... amazing typescipt

// test
const def: ZodValidatorDefinition = {
  hello: z.object({
    field: z.number(),
  }),
  another: z.string(),
};
// type Derived = {
//   readonly [x: string]: any;
// };
type Derived = InferZodValidatorType<typeof def>;
