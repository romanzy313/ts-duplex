import { ValidatorFn } from '../types';
import z from 'zod';

// dont use it!
type ZodValidatorDefinition = Record<string, z.ZodSchema>;

export type InferZodValidatorType<T extends ZodValidatorDefinition> = {
  [Key in keyof T]: z.infer<T[Key]>;
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
