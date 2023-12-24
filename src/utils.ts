import parse from 'fenceparser';

export function isCodeReference(meta: string): boolean {
  // @ts-expect-error: the library definition is wrong.
  return parse(meta).reference === true;
}

export async function readCode(
  referenceUrl: string,
  dedentCode = true,
): Promise<string> {
  const url = new URL(referenceUrl);

  const range = url.hash.slice(1);
  let [fromLine, toLine] = range
    .split('-')
    .map((line) => (line !== undefined ? Number(line.slice(1)) : undefined));
  fromLine ??= 0;
  toLine ??= Infinity;

  if (
    fromLine === undefined ||
    toLine === undefined ||
    isNaN(fromLine) ||
    isNaN(toLine)
  ) {
    throw new Error(
      `URL does not have a valid line range: ${range || 'no range given'}.`,
    );
  }

  const [, user, repo, , ...path] = url.pathname.split('/');
  const response = await fetch(
    `https://raw.githubusercontent.com/${user}/${repo}/${path.join('/')}`,
  );

  if (response.ok) {
    const code = await response.text();
    const lines = code.split('\n');
    const extractedLines = lines.slice(fromLine - 1, toLine);
    const processedLines = dedentCode ? dedent(extractedLines) : extractedLines;

    return processedLines.join('\n');
  }

  throw new Error(`Failed to fetch code: ${response.text()}`);
}

function dedent(lines: string[]): string[] {
  const minWhiteSpaces = Math.min(
    ...lines.map((line) => {
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
