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
https://github.com/mdn/content/blob/83f3bb0c0663edf3c4f86da8a07d8ac0a75b5ccb/scripts/front-matter_utils.js#L68-L80
```
````

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
if (value) {
  if (attr === 'status' && Array.isArray(value) && value.length) {
    fmOrdered[attr] = value.sort();
  } else if (attr === 'browser-compat' || attr === 'spec-urls') {
    if (Array.isArray(value) && value.length === 1) {
      fmOrdered[attr] = value[0];
    } else {
      fmOrdered[attr] = value;
    }
  } else {
    fmOrdered[attr] = value;
  }
}
```

<div class="github-code-link"><a href=https://github.com/mdn/content/blob/83f3bb0c0663edf3c4f86da8a07d8ac0a75b5ccb/scripts/front-matter_utils.js#L68-L80 target="_blank">See full example on GitHub</a></div>

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
      if (value) {
        if (attr === "status" && Array.isArray(value) && value.length) {
          fmOrdered[attr] = value.sort();
        } else if (attr === "browser-compat" || attr === "spec-urls") {
          if (Array.isArray(value) && value.length === 1) {
            fmOrdered[attr] = value[0];
          } else {
            fmOrdered[attr] = value;
          }
        } else {
          fmOrdered[attr] = value;
        }
      }
```

<div class="github-code-link"><a href=https://github.com/mdn/content/blob/83f3bb0c0663edf3c4f86da8a07d8ac0a75b5ccb/scripts/front-matter_utils.js#L68-L80 target="_blank">See full example on GitHub</a></div>

</div>

````

[1]: https://github.com/unifiedjs/unified
[2]: https://github.com/remarkjs/remark
[3]: https://github.com/saucelabs/docusaurus-theme-github-codeblock
