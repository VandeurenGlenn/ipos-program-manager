import { fetch, warn, removeSources, uninstallProgram, globProgram } from './util.js';
import { validateOptions, transformOptions } from './modules/options.js';
import { cachePath, programPath, sourcesPath } from './modules/paths.js';
import { existsOrCreate, exists, writeToCache, write, read }  from './modules/fs.js';
import decompress from 'decompress';
import download from 'download';
import { join } from 'path';
import { prompt } from 'inquirer';

// TODO: check cache before downloading sources
// TODO: Implement ipfs ipm registry

const searchRegistery = async () => {
  // todo get from ipfs
  return null;
};

/**
 * @param {string} program - name of program to download (can also be an url...)
 * @param {string} [version] - wanted version to install
 * @param {string}
 */
const searchNPMRegistery = async (program, version) => {
  try {
    let data = await fetch(`https://registry.npmjs.com/${program}`);
    data = JSON.parse(data);
    if (data.error && data.error === 'Not found') return null;
    else if (data.error) throw error;
    version = data.versions[version];
    if (!version) version =  data['dist-tags'].latest;
    version = data.versions[version];
    // version.gitHead
    data = await download(`${version.dist.tarball}`);
    await writeToCache(version.dist.tarball.split('/-/')[1], data);
    await decompress(data, '/.sources', {
      map: file => {
        let path = version.name;
        if (version) path = `${version.name}-${version.version}`;
        file.path = join(path, file.path.replace('package/', ''));
        return file;
      }});
    console.log(`sources added for ${program}@${version.version}`);
    return 1;
  } catch (error) {
    throw error;
  }
};

const getFromGithub = async (url, version) => {
  try {
    const program = url.match(/(?!.*\/)(.*?)+/)[0];
    if (!version) version = 'master';
    if (!url.includes('archive')) url = `${url.replace(/$\/+/, '')}/archive/${version}.tar.gz`;

    const data = await download(url);
    const tarPath = Boolean(version && version !== 'master') ? `${program}-${version}` : program;
    await writeToCache(tarPath, data);
    console.log(`there is some unpacking going on, please hang tight`);
    await decompress(data, '/.sources', {
      map: file => {
        let path = program;
        if (version && version !== 'master') path = `${program}-${version}`;
        file.path = join(path, file.path.replace(path, ''));
        return file;
      }});

      console.log(`sources added for ${program}@${version}`);
      return 1;
  } catch (error) {
    throw error;
  }
}

const downloadFromURL = async (url, version) => {
  const program = url.match(/(?!.*\/)(.*?)+/)[0];
  try {
    if (url.includes('github')) await getFromGithub(url, version);
    else {
      const data = await download(url);
      await writeToCache(program, data);
      await decompress(data, '/.sources', {
        map: file => {
          let path = program;
          if (version && version !== 'master') path = `${program}-${version}`;
          file.path = join(path, file.path.replace(path, ''));
          return file;
        }});
        console.log(`sources added for ${program}@${version}`);
    }
    return 1;
  } catch (error) {
    throw error;
  }
}

const searchGithubRegistery = async (program, version) => {
  const map = new Map();
  let data = await fetch(`https://api.github.com/search/repositories?q=${program}&sort=stars&order=desc`);
  const choices = JSON.parse(data).items.filter(({ full_name, name, description, html_url }) => {
    map.set(full_name, html_url);
    if (name === program) return { name: `${full_name}${description ? ` - ${description}` : ''}`, value: full_name }
  });
  const answer = { program };
  if (choices.length > 1) {
    answer = await prompt({
        type: 'list',
        name: 'program',
        message: 'choose the one you desire the most.',
        choices
    });
  } else {
    map.set(choices[0].value, choices[0].html_url)
    answer.program = choices[0].value;
  }

  return await getFromGithub(map.get(answer.program), version);
}

/**
 *  Download program to sources (program sources are cached in the /.cache directory)
 *
 * @param {string} program - name of program to download (can also be an url...)
 * @param {string} [version] - wanted version to install
 */
const get = async (program, version) => {
  await existsOrCreate(['/.cache', '/.sources']);
  try {
    let sources;
    // TODO: handle fecthing branches
    if (program.includes('https')) sources = await downloadFromURL(program, version);
    if (!sources) sources = await searchRegistery(program, version);
    if (!sources) sources = await searchGithubRegistery(program, version); // try building from sources first
    if (!sources) sources = await searchNPMRegistery(program, version);

    if (!sources) warn(`nothing found for ${program}`);
  } catch (error) {
    throw error;
  }
};

const updateProgram = program => {
  warn('Running in draft function, things might not work (yet).');
  if (!program) console.log('updating all programs');
  else console.log(`updating ${program}`);
}

const installProgram = async (program, version) => {
  warn('Running in draft function, things might not work (yet).');
  warn('Not implemented yet, waiting on finilazed build SPEC');
  try {
    await existsOrCreate(['/programs', '/.packages']);
    // TODO: Integrate according ipos bulld SPEC
    return;
  } catch (error) {
    throw error;
  }
}

const programInCache =  async (program, version) => {
  if (version) program = `${program}-${version}`;
  return Boolean(globProgram(cachePath(program)).length > 0);
};

const whereisProgram = async program =>  {
  const result = {};
  const cached = await globProgram(cachePath(program));
  const sources = await globProgram(sourcesPath(program));
  const installed = await globProgram(programPath(program));
  console.group();
  if (cached) console.log(`cached entries: ${cached.map(c => `\n\t ${c}`)}`);
  if (sources) console.log(`source entries: ${sources.map(c => `\n\t ${c}`)}`);
  if (installed) console.log(`install entries: ${installed.map(c => `\n\t ${c}`)}`);
  if (!installed) console.log(`${program} not installed`);
  console.groupEnd();
  return;
}

const programVersion = async program => {
  const result = await globProgram(programPath(program));
  if (result.length === 0) return console.log(`${program} not installed`);
  return await result.map(async path => {
      try {
        const version = await read(join(path, 'version'))
        console.log(version);
        return version;
      } catch (error) {
        if (error.code === 'ENOENT') console.warn(`no version specified for ${program} @${path}`);
        else throw error;
      }
  })
}

export default async (program, options = {}) => {
  await validateOptions(program, options);
  const { add, install, remove, uninstall, update, whereis } = transformOptions(options);
  const parts = program.split('@');
  const version = parts[1];
  program = parts[0];

  if (whereis) return await whereisProgram(program);
  if (options.version) return await programVersion(program);

  const inCache = await programInCache(program, version)
  if (add && !inCache) await get(program, version);
  if (install) await installProgram(program, version);
  if (remove) await removeSources(program, version);
  if (uninstall) await uninstallProgram(program, version);
  if (update) await updateProgram(program);
}
