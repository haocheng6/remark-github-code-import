// This file is used for testing.

export function once(fn) {
  let called = false;

  return function (...args) {
    if (called) {
      return undefined;
    }
    called = true;
    return fn(...args);
  };
}
