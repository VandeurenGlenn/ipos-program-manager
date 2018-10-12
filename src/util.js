import { fetchUrl } from 'fetch';
import del from 'del';
import chalk from 'chalk'
import glob from 'glob';
import { cachePath, programPath, sourcesPath } from './modules/paths.js';

export const fetch = url => new Promise((resolve, reject) => {
  fetchUrl(url, (error, meta, body) => {
    if (error) return reject(error);
    resolve(body.toString());
  });
});

export const removeSources = async (program, version) => {
  if (version) program = `${program}-${version}`;
  return del.sync(sourcesPath(program), { force: true });
}

export const uninstallProgram = async (program, version) => {
  await removeSources(program, version);
  if (version) program = `${program}-${version}`;
  return del.sync(programPath(program), { force: true });
}

export const cleanCache = async (program, version) => {
  if (!program) program = '**';
  if (version) program = `${program}-${version}`;
  return del.sync(cachePath(program), { force: true });
}

export const warn = text => {
  console.warn(chalk.yellow(text));
}

export const globProgram = path => glob.sync(`${path}**`);
