import { visit } from 'unist-util-visit';

import { isCodeReference, readCode } from './utils.js';

import type { Code, Html, Root } from 'mdast';
import type { Plugin } from 'unified';

const PLUGIN_NAME = 'remark-github-code-import';

/**
 * Options type for the remark-github-code-import plugin.
 */
export type Options = {
  /**
   * Whether to dedent the extracted code. If true, the minimum number of leading
   * whitespaces at the beginning of all extracted lines will be removed from
   * each line.
   *
   * @default true
   */
  dedentCode?: boolean;
};

const remarkGithubCodeImport: Plugin<[options: Options], Root> = (
  { dedentCode = true } = {} as Options,
) => {
  return async (tree, file) => {
    const references: Array<[node: Code, url: string]> = [];

    visit(tree, 'code', (node, index, parent) => {
      if (index === undefined || parent === undefined) {
        return;
      }
      if (typeof node.meta !== 'string' || !isCodeReference(node.meta)) {
        return;
      }

      const url = node.value.trim().split('\n')[0];
      if (url === undefined) {
        file.message('No URL found in the code block.', node, PLUGIN_NAME);
        return;
      }

      references.push([node, url]);

      parent.children.splice(
        index,
        1,
        {
          type: 'html',
          value: '<div class="imported-github-code">',
        } satisfies Html,
        node,
        {
          type: 'html',
          value: `<div class="github-code-link"><a href=${url} target="_blank">See full example on GitHub</a></div>`,
        } satisfies Html,
        {
          type: 'html',
          value: '</div>',
        } satisfies Html,
      );

      return index + 4;
    });

    for (const [node, url] of references) {
      try {
        node.value = await readCode(url, dedentCode);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : undefined;
        file.message(
          `Failed to import code from ${url}${
            errorMessage !== undefined ? ': ' + errorMessage : ''
          }`,
          node,
          PLUGIN_NAME,
        );
      }
    }
  };
};

export default remarkGithubCodeImport;
