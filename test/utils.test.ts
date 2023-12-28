import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dedent,
  isCodeReference,
  parseLineRange,
  readCode,
} from '../src/utils.js';

import { getFixtureString } from './helpers.js';

describe('isCodeReference', () => {
  it.each(['', 'random', '[index.js]'])(
    'returns false when the given meta string does not contain "reference"',
    (input) => {
      expect(isCodeReference(input)).toBe(false);
    },
  );

  it.each([
    'reference="book"',
    'title="code reference"',
    'other_reference',
    'other_reference=1',
  ])(
    'returns false when the given meta string contains "reference" but it is part of other properties',
    (input) => {
      expect(isCodeReference(input)).toBe(false);
    },
  );

  it.each([
    'reference',
    'reference title="code title"',
    'title="code title" reference',
    '[index.js] reference',
  ])(
    'returns true when the given meta string contains the "reference" property',
    (input) => {
      expect(isCodeReference(input)).toBe(true);
    },
  );
});

describe('parseLineRange', () => {
  it('returns `undefined` when no line range is given', () => {
    expect(parseLineRange('')).toBe(undefined);
  });

  it.each([
    'L',
    'La',
    'L1x',
    '-',
    'L-L',
    'L1-',
    '-L10',
    'L1x-L10',
    'L1-Lx',
    'X1-X3',
    'L1-L10_',
  ])('throws an error when an invalid line range (%s) is given', (range) => {
    expect(() => parseLineRange(range)).toThrow(
      `Invalid line range: ${range}.`,
    );
  });

  it.each([
    ['L10', 10],
    ['L1-L3', [1, 3]],
    ['L10-L10', [10, 10]],
  ])(
    'returns the parsed line range when a valid line range (%s) is given',
    (range, result) => {
      expect(parseLineRange(range)).toStrictEqual(result);
    },
  );
});

describe('readCode', () => {
  const mockCode = getFixtureString('input/example.js');
  const mockUrl = 'https://github.com/user/repo/blob/branch/folder/example.js';

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return { text: async () => mockCode, ok: true } as Response;
    });
  });

  describe('when `dedentCode` is false', () => {
    it('reads code from the entire file when no line range is given', async () => {
      expect(await readCode(mockUrl, false)).toMatchFileSnapshot(
        './fixtures/input/example.js',
      );
    });

    it('reads code from the specified line range when a line range is given', async () => {
      expect(await readCode(`${mockUrl}#L6-L12`, false)).toMatchFileSnapshot(
        './fixtures/output/example_line_range.js',
      );
    });

    it('reads code from the specified line range when a single line is given', async () => {
      expect(await readCode(`${mockUrl}#L8`, false)).toMatchFileSnapshot(
        './fixtures/output/example_single_line.js',
      );
    });
  });

  describe('when `dedentCode` is true', () => {
    it('reads code from the entire file when no line range is given', async () => {
      expect(await readCode(mockUrl, true)).toMatchFileSnapshot(
        './fixtures/input/example.js',
      );
    });

    it('reads code from the specified line range when a line range is given', async () => {
      expect(await readCode(`${mockUrl}#L6-L12`, true)).toMatchFileSnapshot(
        './fixtures/output/example_line_range_dedented.js',
      );
    });

    it('reads code from the specified line range when a single line is given', async () => {
      expect(await readCode(`${mockUrl}#L8`, true)).toMatchFileSnapshot(
        './fixtures/output/example_single_line_dedented.js',
      );
    });
  });

  describe('error handling', () => {
    it('throws an error if an invalid line range is given', async () => {
      await expect(() => readCode(`${mockUrl}#L6X`)).rejects.toThrowError(
        'Invalid line range: L6X.',
      );
    });

    it('throws an error if the fetch call failed', async () => {
      vi.spyOn(global, 'fetch').mockImplementation(async () => {
        return { text: async () => '404: Not Found', ok: false } as Response;
      });

      await expect(() => readCode(mockUrl)).rejects.toThrowError(
        'Failed to fetch code: 404: Not Found',
      );
    });
  });
});

describe('dedent', () => {
  it('does nothing when the given lines do not contain any leading whitespaces', () => {
    const lines = [
      'console.log("hello world!");',
      'console.log("hello world!");',
      'console.log("hello world!");',
    ];

    expect(dedent(lines)).toStrictEqual(lines);
  });

  it('removes leading spaces', () => {
    const lines = [
      '    console.log("hello world!");',
      '    console.log("hello world!");',
      '    console.log("hello world!");',
    ];

    expect(dedent(lines)).toStrictEqual([
      'console.log("hello world!");',
      'console.log("hello world!");',
      'console.log("hello world!");',
    ]);
  });

  it('removes leading tabs', () => {
    const lines = [
      '\tconsole.log("hello world!");',
      '\tconsole.log("hello world!");',
      '\tconsole.log("hello world!");',
    ];

    expect(dedent(lines)).toStrictEqual([
      'console.log("hello world!");',
      'console.log("hello world!");',
      'console.log("hello world!");',
    ]);
  });

  it('ignores blank lines', () => {
    const lines = [
      '    console.log("hello world!");',
      '', // blank line
      '    console.log("hello world!");',
      '', // blank line
      '    console.log("hello world!");',
    ];

    expect(dedent(lines)).toStrictEqual([
      'console.log("hello world!");',
      '',
      'console.log("hello world!");',
      '',
      'console.log("hello world!");',
    ]);
  });

  it('works when the given lines are all blank', () => {
    const lines = [
      '', // blank line
      '', // blank line
      '', // blank line
    ];

    expect(dedent(lines)).toStrictEqual(lines);
  });
});
