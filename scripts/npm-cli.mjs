import fs from 'node:fs';
import path from 'node:path';

export function npmCLI() {
  const candidates = [process.env.BRAND_SUITE_NPM_CLI, process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')];
  const found = candidates.find(p => p && fs.existsSync(p));
  if (!found) throw Error('Cannot locate npm CLI; set BRAND_SUITE_NPM_CLI to npm-cli.js');
  return found;
}
