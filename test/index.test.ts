import { remark } from 'remark';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import remarkGithubCodeImport from '../src/index.js';

import { getFixtureString, getFixtureVFile } from './helpers.js';

describe('remarkGithubCodeImport', () => {
  const mockCode = getFixtureString('input/example.js');

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return { text: async () => mockCode, ok: true } as Response;
    });
  });

  it('imports an entire file when the URL in the reference code block does not specify a line range', async () => {
    const processor = remark().use(remarkGithubCodeImport);
    const markdown = await getFixtureVFile('input/entire_file.md');

    expect(String(await processor.process(markdown))).toMatchFileSnapshot(
      './fixtures/output/entire_file.md',
    );
  });

  it('imports code from the specified line range when the URL in the reference code block specifies a line range', async () => {
    const processor = remark().use(remarkGithubCodeImport);
    const markdown = await getFixtureVFile('input/line_range.md');

    expect(String(await processor.process(markdown))).toMatchFileSnapshot(
      './fixtures/output/line_range_dedented.md',
    );
  });

  it('imports code from the specified line when the URL in the reference code block specifies a line', async () => {
    const processor = remark().use(remarkGithubCodeImport);
    const markdown = await getFixtureVFile('input/single_line.md');

    expect(String(await processor.process(markdown))).toMatchFileSnapshot(
      './fixtures/output/single_line_dedented.md',
    );
  });

  it('does not dedent the imported code when the `dedentCode` options is false', async () => {
    const processor = remark().use(remarkGithubCodeImport, {
      dedentCode: false,
    });
    const markdown = await getFixtureVFile('input/line_range.md');

    expect(String(await processor.process(markdown))).toMatchFileSnapshot(
      './fixtures/output/line_range.md',
    );
  });

  it('throws an error if the reference code block does not contain a URL', async () => {
    const processor = remark().use(remarkGithubCodeImport);
    const markdown = await getFixtureVFile('input/no_url.md');

    await expect(() => processor.process(markdown)).rejects.toThrowError(
      '[no_url.md:3:1-4:4] No URL found in the code block.',
    );
  });

  it('throws an error if the fetch call failed', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return { text: async () => '404: Not Found', ok: false } as Response;
    });

    const processor = remark().use(remarkGithubCodeImport);
    const markdown = await getFixtureVFile('input/entire_file.md');

    await expect(() => processor.process(markdown)).rejects.toThrowError(
      '[entire_file.md:3:1-5:4] Failed to import code from https://github.com/user/repo/blob/branch/folder/example.js: Failed to fetch code: 404: Not Found',
    );
  });
});
