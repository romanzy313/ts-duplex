import { ValidatorFn } from '../types';
import { Static, type TAnySchema } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { ValidationError } from '../helpers/errors';

// dont use it!
type TypeboxValidatorDefinition = Record<string, TAnySchema>;
type CompiledValidators = Record<string, (value: unknown) => any>;

export type InferTypeboxValidatorType<T extends TypeboxValidatorDefinition> = {
  [Key in keyof T]: Static<T[Key]>;
};

export function tbValidator(def: TypeboxValidatorDefinition): ValidatorFn {
  // compile all ahead of time
  const compiled: CompiledValidators = {};
  Object.entries(def).forEach(([key, schema]) => {
    const C = TypeCompiler.Compile(schema);
    compiled[key] = (value) => {
      const success = C.Check(value);
      if (success) {
        // important!!! extra keys are returned too
        return value;
      }

      const errors = [...C.Errors(value)];

      // TODO this is rough
      throw new ValidationError(`validation error ${JSON.stringify(errors)}`);
    };
  });

  return (key, value) => {
    if (!(key in compiled)) {
      throw new ValidationError(`unknown event '${key}'`);
    }

    const validator = compiled[key];

    return validator(value);
  };
}
