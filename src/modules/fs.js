import { writeFile, readFile, accessSync, mkdir } from 'fs';
import { cachePath, programPath, sourcesPath } from './paths.js';

export const write = (path, data) => new Promise((resolve, reject) => {
  writeFile(path, data, error => {
    if (error) reject(error);
    else resolve();
  });
});

export const read = (path, data) => new Promise((resolve, reject) => {
  readFile(path, (error, data) => {
    if (error) reject(error);
    else resolve(data);
  });
});

export const writeToCache = (path, data) => write(cachePath(path), data);

export const writeToSources = (path, data) => write(sourcesPath(path), data);

export const writeToPrograms = (path, data) => write(ProgramPath(path), data);

export const exists = async path => {
  try {
    await accessSync(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    else throw error;
  }
}

export const existsOrCreate = async path => {
  if (!Array.isArray(path)) path = [...path];
  path.forEach(async path => {
    try {
      await accessSync(path);
    } catch (error) {
      if (error.code === 'ENOENT') mkdir(path);
      else throw error;
    }
  });
};
