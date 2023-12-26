# remark-github-code-import

This is a [unified][1] ([remark][2]) plugin that imports code from a GitHub URL,
inspired by [docusaurus-theme-github-codeblock][3].

## Installation

```
npm install remark-github-code-import
```

## Usage

```js
import { remark } from 'remark';
import remarkGithubCodeImport from 'remark-github-code-import';
import { read } from 'to-vfile';

const processor = remark().use(remarkGithubCodeImport);
const markdown = await read('example.md');
const result = await processor.process(markdown);

console.log(String(result));
```

## Options

This plugin recognizes the following option:

#### `dedentCode`

Valid values: `boolean`\
Default: `true`

If this option is `true`, the minimum number of leading whitespaces at the
beginning of all extracted lines will be removed from each line. Otherwise, no
whitespaces will be removed.

## Examples

Suppose we have the following Markdown file `example.md`:

````markdown
# Example

```js reference
https://github.com/haocheng6/remark-github-code-import/blob/53802a344076676ef068e236285306f8cee086ba/src/utils.ts#L43-L49
```
````

> [!TIP]
> The line number range at the end of the URL is optional. When no range is
> specified, the content of the entire file will be imported.
> 
> You can also specify a single line like `https://github.com/haocheng6/remark-github-code-import/blob/53802a344076676ef068e236285306f8cee086ba/src/utils.ts#L43`.

### Using the Default Configuration

Running the following JavaScript:

```js
import { remark } from 'remark';
import remarkGithubCodeImport from 'remark-github-code-import';
import { read } from 'to-vfile';

const processor = remark().use(remarkGithubCodeImport);
const markdown = await read('example.md');
const result = await processor.process(markdown);

console.log(String(result));
```

Would output the following:

````markdown
# Example

<div class="imported-github-code">

```js reference
if (range === undefined) {
  [fromLine, toLine] = [1, Infinity];
} else if (typeof range === 'number') {
  [fromLine, toLine] = [range, range];
} else {
  [fromLine, toLine] = range;
}
```

<div class="github-code-link"><a href=https://github.com/haocheng6/remark-github-code-import/blob/53802a344076676ef068e236285306f8cee086ba/src/utils.ts#L43-L49 target="_blank">See full example on GitHub</a></div>

</div>

````

### Setting `dedentCode` to `false`

Running the following JavaScript:

```js
import { remark } from 'remark';
import remarkGithubCodeImport from 'remark-github-code-import';
import { read } from 'to-vfile';

const processor = remark().use(remarkGithubCodeImport, { dedentCode: false });
const markdown = await read('example.md');
const result = await processor.process(markdown);

console.log(String(result));
```

Would output the following:

````markdown
# Example

<div class="imported-github-code">

```js reference
  if (range === undefined) {
    [fromLine, toLine] = [1, Infinity];
  } else if (typeof range === 'number') {
    [fromLine, toLine] = [range, range];
  } else {
    [fromLine, toLine] = range;
  }
```

<div class="github-code-link"><a href=https://github.com/haocheng6/remark-github-code-import/blob/53802a344076676ef068e236285306f8cee086ba/src/utils.ts#L43-L49 target="_blank">See full example on GitHub</a></div>

</div>

````

[1]: https://github.com/unifiedjs/unified
[2]: https://github.com/remarkjs/remark
[3]: https://github.com/saucelabs/docusaurus-theme-github-codeblock
