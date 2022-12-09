import { join } from 'path';

export const appPath = app => join('/.ipm', 'apps', app || '');

export const packagesPath = program => join('/.ipm', '.packages', program || '');

export const cachePath = path => join('/.ipm', '.cache', path || '');
