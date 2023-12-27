import parse from 'fenceparser';

const lineRangeRegex = /^L(\d+)(?:-L(\d+))?$/;

export function isCodeReference(meta: string): boolean {
  // @ts-expect-error: the library definition is wrong.
  return parse(meta).reference === true;
}

export function parseLineRange(
  range: string,
): undefined | number | [number, number] {
  if (!range) {
    return undefined;
  }

  const match = range.match(lineRangeRegex);
  if (match === null) {
    throw new Error(`Invalid line range: ${range}.`);
  }

  const fromLineStr = match[1];
  const toLineStr = match[2];
  const fromLine = Number(fromLineStr);
  const toLine = Number(toLineStr);

  if (toLineStr === undefined) {
    return fromLine;
  }
  return [fromLine, toLine];
}

export async function readCode(
  referenceUrl: string,
  dedentCode = true,
): Promise<string> {
  const url = new URL(referenceUrl);

  const range = parseLineRange(url.hash.slice(1));
  let fromLine: number;
  let toLine: number;

  if (range === undefined) {
    [fromLine, toLine] = [1, Infinity];
  } else if (typeof range === 'number') {
    [fromLine, toLine] = [range, range];
  } else {
    [fromLine, toLine] = range;
  }

  const [, user, repo, , ...path] = url.pathname.split('/');
  const response = await fetch(
    `https://raw.githubusercontent.com/${user}/${repo}/${path.join('/')}`,
  );

  if (response.ok) {
    const code = await response.text();
    const trimmedCode = code.at(-1) === '\n' ? code.slice(0, -1) : code;
    const lines = trimmedCode.split('\n');
    const extractedLines = lines.slice(fromLine - 1, toLine);
    const processedLines = dedentCode ? dedent(extractedLines) : extractedLines;

    return processedLines.join('\n');
  }

  throw new Error(`Failed to fetch code: ${response.text()}`);
}

export function dedent(lines: string[]): string[] {
  const minWhiteSpaces = Math.min(
    ...lines.filter(Boolean).map((line) => {
      let count = 0;
      for (const c of line) {
        if (c === ' ' || c === '\t') {
          count++;
        } else {
          break;
        }
      }
      return count;
    }),
  );

  return lines.map((line) => line.slice(minWhiteSpaces));
}
