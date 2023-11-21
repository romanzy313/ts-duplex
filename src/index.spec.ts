import { DummyClass } from './index';
import { describe, it, expect } from 'vitest';

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('DummyClass is instantiable', () => {
    expect(new DummyClass()).toBeInstanceOf(DummyClass);
    expect(new DummyClass().sayHi()).toBe('hello');
  });
});
