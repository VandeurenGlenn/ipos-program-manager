import { writeFile, access, mkdir } from 'fs/promises';
import { join, sep } from 'path';

import { cachePath, appPath, packagesPath } from './paths.js';

export const writeToCache = (path, data) => writeFile(cachePath(path), data);

export const writeToPackages = (path, data) => writeFile(packagesPath(path), data);

export const writeToPrograms = (path, data) => writeFile(appPath(path), data);

export const exists = async path => {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    else throw error;
  }
}

export const existsOrCreate = async path => {
  if (!Array.isArray(path)) path = [path];
  path.forEach(async path => {
    try {
      await access(path);
    } catch (error) {
      
      
      if (error.code === 'ENOENT') {
        const splits = path.split(sep)
        const dirs = splits.slice(1, splits.length)
        let parent = sep
        for (const dir of dirs) {
          parent = join(parent, dir)
          try {
            await access(parent);            
          } catch (error) {
            if (error.code === 'ENOENT') await mkdir(parent)
            else throw error;
          }
        }
        
      }
      else throw error;
    }
  });
};
