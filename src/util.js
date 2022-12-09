import chalk from 'chalk'
import { globby as glob } from 'globby';

import { cachePath, appPath, packagesPath } from './modules/paths.js';
import { execFile } from 'node:child_process'
import { readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

export const remove = async path => {
  await rm(path, {recursive: true, force: true})
  return path
}

export const fetchString = async url => {
  const response = await fetch(url)
  return response.toString()  
}

export const uninstallProgram = async (program, version) => {
  if (version) program = `${program}@${version}`;
  return remove(appPath(program))
}

export const cleanCache = async (program, version) => {
  if (!program) program = '**';
  if (version) program = `${program}-${version}`;
  return remove(cachePath(program))
}

export const warn = text => {
  console.warn(chalk.yellow(text));
}

export const hasPackage = async (path) => {
  try {
    await readFile(join(path, 'package.json'))
  } catch {
    return false
  }
  return true
}
export const globProgram = path => glob(`${path}**`);

export const purge = async (app, version, all) => {
  if (all) return purgeAll(app)
  console.log(`purging ${app}`);
  if (version) app = `${app}@${version}`
  const purges = await Promise.allSettled([
    remove(appPath(app)),
    remove(cachePath(app)),
    remove(packagesPath(app))
  ])

  console.log(`purged ${app}`);
  console.group()
  purges.forEach((purge, i) => {
    if (purge.status === 'fulfilled') console.log(purge.value);
  })
  console.groupEnd()
}

export const getContent = async path => {
  return readdir(path)
}

export const purgeAll = async (app) => {
  console.log(`purging ${app}`);
  const dirContents = await Promise.all([
    getContent(appPath()),
    getContent(cachePath()),
    getContent(packagesPath())
  ])

  dirContents[0] = dirContents[0].filter(name => name === app || name.split('@')?.[0] === app)
  dirContents[1] = dirContents[1].filter(name => name === app || name.split('@')?.[0] === app)
  dirContents[2] = dirContents[2].filter(name => name === app || name.split('@')?.[0] === app)
  
  let purges = [...dirContents[0], ...dirContents[1], ...dirContents[2]]

  purges = await Promise.allSettled(purges.map(async app => {
    const paths = []
    paths.push(remove(appPath(app)))
    paths.push(remove(cachePath(app)))
    paths.push(remove(packagesPath(app)))
    return Promise.all(paths)
  }))

  console.log(`purged ${app}`);
  console.group()
  purges.forEach(purge => {
    if (purge.status === 'fulfilled') console.log(purge.value);
  })
  console.groupEnd()
}