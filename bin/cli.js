#!/usr/bin/env node
const ipm = require('./../lib/ipm.js');

const params = {
	cache: true
}

let program = undefined;

const getNextParam = param => {
	const index = process.argv.indexOf(param) + 1;
	if (index === -1) throw new Error(`No program specified to ${param}`);
	return process.argv[index];
}

for (const param of process.argv) {
	switch (param) {
    case 'add':
      params.add = true;
			program = getNextParam('add')
    break;
		case 'remove':
      params.remove = true;
			program = getNextParam('remove')
    break;
	  case 'install':
      params.install = true;
			program = getNextParam('install')
    break;
    case 'uninstall':
      params.uninstall = true;
			program = getNextParam('uninstall')
    break;
		case 'version':
			params.version = true;
			program = getNextParam('version')
		break;
		case 'whereis':
			params.whereis = true;
			program = getNextParam('whereis')
		break;
    case '--dev':
      params.dev = true;
    break;
		case '--no-cache':
			params.cache = false;
		break;
		case '--help':
			console.group();

			console.log(`add: download program & add to /.sources
				ipm add 'program[@version]'
				`);

			console.log(`remove: remove program source from /.sources
				ipm remove 'program[@version]'
				`);

			console.log(`uninstall: uninstall program and remove sources if any
				ipm uninstall 'program[@version]'
				`);

				// TODO: implement
				// NOTE:
			console.log(`update: (experimental) update programs to their latest version
				updates all programs when none defined.
				ipm update '[program[@version]]'
				`);

			console.groupEnd();
		break;
		case '--version':
			const { join } = require('path');
			require('fs').readFile(join(__dirname, 'package.json'), (error, data) => {
				if (error) return console.error(error);

				const { version } = JSON.parse(data.toString());
				console.log(`version: ${version}`)
			})
		break;
	}
}

imp(program, params);
