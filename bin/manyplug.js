#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import { installCommand }          from '../src/install.js';
import { listCommand }             from '../src/list.js';
import { removeCommand }           from '../src/remove.js';
import { enableCommand, disableCommand } from '../src/enable.js';
import { syncCommand, updateCommand }    from '../src/sync.js';
import { initCommand }             from '../src/init.js';
import { validateCommand }         from '../src/validate.js';

const pkg = createRequire(import.meta.url)('../package.json');

// ------------------------------------------------------------
// help
// ------------------------------------------------------------

function printHelp(cmd) {
	if (!cmd) {
		console.log(`manyplug ${pkg.version} — plugin manager for ManyBot`);
		console.log('https://git.stxerr.dev/manyplug.git\n');
		console.log('commands: init install remove list enable disable sync update validate');
		console.log('options:  -v/--version  help <command>');
		return;
	}

	const c = program.commands.find(c => c.name() === cmd || c.aliases().includes(cmd));
	if (!c) { console.error(`unknown command: ${cmd}`); process.exit(1); }

	const args = c.registeredArguments
		.map(a => (a.required ? `<${a._name}>` : `[${a._name}]`)).join(' ');

	console.log(`manyplug ${c.name()} ${args}`);
	console.log(c.description());

	if (c.aliases().length)
		console.log(`aliases: ${c.aliases().join(', ')}`);

	const opts = c.options;
	if (opts.length) {
		console.log('\noptions:');
		for (const o of opts)
			console.log(`  ${o.flags.padEnd(22)} ${o.description}`);
	}
}

// ------------------------------------------------------------
// program
// ------------------------------------------------------------

program
	.name('manyplug')
	.version(pkg.version, '-v, --version')
	.helpOption(false);

program.command('help [command]').description('show help for a command')
	.action(cmd => { printHelp(cmd); process.exit(0); });

program.command('init [name]').description('create new plugin boilerplate')
	.option('-c, --category <cat>', 'category (games media utility service admin fun)', 'utility')
	.option('--service', 'mark as background service plugin', false)
	.action(initCommand);

program.command('install [plugins...]').description('install plugins from registry or local path')
	.option('-l, --local <path>', 'install from local path')
	.option('-y, --yes',          'skip confirmation')
	.option('--needed',           'skip already up-to-date plugins')
	.action(installCommand);

program.command('remove [plugins...]').alias('rm').description('remove installed plugins')
	.option('-y, --yes',          'skip confirmation')
	.option('--remove-deps',      'also uninstall npm dependencies')
	.action(removeCommand);

program.command('list').alias('ls').description('list installed plugins (enabled only by default)')
	.option('-a, --all', 'include disabled plugins')
	.action(listCommand);

program.command('enable [plugins...]').description('enable plugins')
	.action(enableCommand);

program.command('disable [plugins...]').description('disable plugins')
	.action(disableCommand);

program.command('validate [path]').alias('val').description('validate manyplug.json')
	.action(validateCommand);

program.command('sync').description('sync local registry with remote')
	.option('-f, --force', 'save even if nothing changed')
	.action(syncCommand);

program.command('update').description('install/update all plugins from remote')
	.option('-y, --yes', 'skip confirmation')
	.action(updateCommand);

// ------------------------------------------------------------

if (process.argv.length <= 2) { printHelp(); process.exit(0); }

program.on('command:*', ([op]) => {
	console.error(`unknown command: ${op}`);
	console.error('run "manyplug help" for usage');
	process.exit(1);
});

program.parse();
