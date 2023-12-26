# Example

<div class="imported-github-code">

```js reference
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
```

<div class="github-code-link"><a href="https://github.com/user/repo/blob/branch/folder/example.js" target="_blank">See full example on GitHub</a></div>

</div>
