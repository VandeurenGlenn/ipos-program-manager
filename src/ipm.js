import { warn, uninstallProgram, hasPackage, purge } from './util.js';
import { validateOptions, transformOptions } from './modules/options.js';
import { cachePath, appPath, packagesPath } from './modules/paths.js';
import { existsOrCreate }  from './modules/fs.js';
import { readdir, readFile, writeFile } from 'fs/promises';
import decompress from 'decompress';
import download from 'download';
import { join, sep } from 'path';
import inquirer from 'inquirer';
const prompt = inquirer.prompt
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
    data = await data.json()
    if (data.error && data.error === 'Not found') return null;
    else if (data.error) throw error;
    version = data.versions[version];

    if (!version) {
      version = data['dist-tags'].latest.split(',')[0]
      version = data.versions[version];
    }
    
    // version.gitHead
    data = await download(`${version.dist.tarball}`);
    await decompress(data, packagesPath(), {
      map: file => {
        // replace package with name and version
        const splits = file.path.split(/\/|\\/g)
        file.path = [`${program}@${version.version}`, ...splits.slice(1, splits.length)].join(sep)
        return file;
      }});
    console.log(`added ${program}@${version.version}`);
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
    const tarPath = Boolean(version && version !== 'master') ? `${program}@${version}` : program;
    await writeFile(cachePath(tarPath), data)
    console.log(`there is some unpacking going on, please hang tight`);
    await decompress(data, packagesPath(), {
      map: file => {
        let path = program;
        if (version && version !== 'master') path = `${program}-${version}`;
        else  file.path = file.path.replace('-master', '')

        file.path = join(path, file.path.replace(path, '')).replace(`-${version}`, `@${version}`)
        return file;
      }});

      console.log(`added ${program}@${version}`);
      return 1;
  } catch (error) {
    if (error.statusCode === 404) return 0
    throw error;
  }
}

const downloadFromURL = async (url, version) => {
  const program = url.match(/(?!.*\/)(.*?)+/)[0];
  try {
    if (url.includes('github')) await getFromGithub(url, version);
    else {
      const data = await download(url);
      await decompress(data, appPath(''), {
        map: file => {
          let path = program;
          if (version && version !== 'master') path = `${program}-${version}`;
          else  file.path = file.path.replace('-master', '')

          file.path = join(path, file.path.replace(path, '')).replace(`-${version}`, `@${version}`)
          return file;
        }});
        console.log(`added ${program}@${version}`);
    }
    return 1;
  } catch (error) {
    return 0
    throw error;
  }
}

const searchGithubRegistery = async (program, version) => {
  const map = new Map();
  let data = await fetch(`https://api.github.com/search/repositories?q=${program}&sort=stars&order=desc`);

  const choices = (await data.json()).items.filter(({ full_name, name, description, html_url }) => {
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
 *  Download program
 * @param {string} program - name of program to download (can also be an url...)
 * @param {string} [version] - wanted version to install
 */
const get = async (program, version) => {
  await existsOrCreate([packagesPath(), cachePath()]);
  try {
    let sources;
    // TODO: handle fecthing branches
    if (program.includes('https')) sources = await downloadFromURL(program, version);
    if (!sources) sources = await searchRegistery(program, version);
    if (!sources) sources = await searchGithubRegistery(program, version); // try building from sources first
    if (!sources) sources = await searchNPMRegistery(program, version);
    console.log(sources);
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
    await existsOrCreate([packagesPath()]);
    // TODO: Integrate according ipos bulld SPEC
    return;
  } catch (error) {
    throw error;
  }
}

const whereisProgram = async program =>  {
  let result = await readdir(appPath())
  let sources = await readdir(packagesPath())

  result = result.filter(name => name === program || name.includes(`${program}@`))  
  sources = sources.filter(name => name === program || name.includes(`${program}@`))
  console.group();
  if (result.length > 0) console.log(`${result.map((c, i) => `${i > 0  ? '\n' : ''}\t ${appPath(c)}`)}`);
  if (sources.length > 0) console.log(`${sources.map((c, i) => `${i > 0  ? '\n' : ''}\t ${packagesPath(c)}`)}`);
  if (result.length === 0 && sources.length === 0) console.log(`${program} not installed`);
  console.groupEnd();
  return [...result, ...sources];
}

const programVersion = async program => {
  try {
    let result = await readdir(appPath())
    let sources = await readdir(packagesPath())

    result = result.filter(name => name === program || name.includes(`${program}@`))  
    sources = sources.filter(name => name === program || name.includes(`${program}@`))
    
    if (result.length === 0 && sources.length === 0) console.log(`${program} not installed`);
    result = await Promise.all(result.map(async path => {    
      let branch
      let version
      if (path === program) branch = 'master'
      else branch = path.split('@')[1]

      if (await hasPackage(appPath(path))) version = JSON.parse((await readFile(join(appPath(path), 'package.json'))).toString()).version
      return `${version} (${branch})`
    }))
    if (result.length === 0 && sources.length === 0) console.log(`${program} not installed`);
    sources = await Promise.all(sources.map(async path => {    
      let branch
      let version
      if (path === program) branch = 'master'
      else branch = path.split('@')[1]

      if (await hasPackage(packagesPath(path))) version = JSON.parse((await readFile(join(packagesPath(path), 'package.json'))).toString()).version
      return `${version} (${branch})`
    }))
    console.group();
    if (result.length > 0) console.log(`${result.map((c, i) => `${i > 0  ? '\n' : ''}\t ${c}`)}`);
    if (sources.length > 0) console.log(`${sources.map((c, i) => `${i > 0  ? '\n' : ''}\t ${c}`)}`);
    if (result.length === 0 && sources.length === 0) console.log(`${program} not installed`);
    console.groupEnd();
    return [...result, ...sources]
  } catch (error) {
    if (error.code === 'ENOENT') return console.log(`${program} not installed`)
  }  
}

export default async (program, options = {}) => {
  await existsOrCreate(appPath())
  const inValid = await validateOptions(program, options);
  if (inValid) throw new Error(inValid)

  const { add, install, remove, uninstall, update, whereis } = transformOptions(options);
  const parts = program.split('@');
  const version = parts[1];
  program = parts[0];

  if (whereis) return await whereisProgram(program);
  if (options.version) return await programVersion(program);
  if (add) await get(program, version);
  if (install) await installProgram(program, version);
  if (options.purge) await purge(program, version, options.all);
  if (uninstall) await uninstallProgram(program, version);
  if (update) await updateProgram(program);
}
