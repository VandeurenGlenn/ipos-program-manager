import { join } from 'path';

export const programPath = program => join('/programs', program);


export const sourcesPath = program => join('/.sources', program);

export const cachePath = path => join('/.cache', path);
