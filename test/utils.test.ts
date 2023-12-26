import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isCodeReference, readCode } from '../src/utils.js';

import { getFixtureString } from './helpers.js';

describe('isCodeReference', () => {
  it.each(['', 'random'])(
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
  ])(
    'returns true when the given meta string contains the "reference" property',
    (input) => {
      expect(isCodeReference(input)).toBe(true);
    },
  );
});

describe('readCode', () => {
  const mockCode = getFixtureString('input/example.js');
  const mockUrl = 'https://github.com/user/repo/blob/branch/folder/example.js';

  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockImplementation(async () => {
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
  });
});
