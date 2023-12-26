# Example

<div class="imported-github-code">

```js reference
return function (...args) {
  if (called) {
    return undefined;
  }
  called = true;
  return fn(...args);
};
```

<div class="github-code-link"><a href="https://github.com/user/repo/blob/branch/folder/example.js#L6-L12" target="_blank">See full example on GitHub</a></div>

</div>
