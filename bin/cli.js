#!/usr/bin/env node
import ipm from './../src/ipm.js'
import packageJSON from './../package.json' assert {type: 'json'}

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
		case 'purge':
      params.purge = true;
			program = getNextParam('purge')
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
		case '--all': 
			params.all = true
		break;
    case '--dev':
      params.dev = true;
    break;
		case '--no-cache':
			params.cache = false;
		break;
		case '--help':
			console.group();

			console.log(`add: download program & add to /.packages
				ipm add 'program[@version]'
				`);

			console.log(`remove: remove program source from /.packages
				ipm remove 'program[@version]'
				`);

			console.log(`purge: purge program and remove packages/cache if any (add --all flag to remove every version)
				ipm purge 'program[@version]'
				`);

			console.log(`uninstall: uninstall program and remove packages if any
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
		case '--version':	console.log(`version: ${packageJSON.version}`)
		break;
	}
}

ipm(program, params);
