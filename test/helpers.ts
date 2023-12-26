import { readFileSync } from 'node:fs';

import { read } from 'to-vfile';

export function getFixtureString(fixture: string) {
  return readFileSync(`${__dirname}/fixtures/${fixture}`, 'utf8');
}

export function getFixtureVFile(fixture: string): ReturnType<typeof read> {
  return read(`${__dirname}/fixtures/${fixture}`);
}
