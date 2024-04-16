#!/usr/bin/env zx

import { needsRootUser } from '../../lib/conditions.mjs';
import { displayDescription } from '../../lib/textHelpers.mjs';

needsRootUser();

displayDescription(
	`This script will create a new git repository to synchronize your changes on a server.`,
);

const repositoryPath = (await question('Repository path ? (default: ~) ')) ?? '~';
const repositoryName = (await question('Repository name ? (no spaces) ')).replaceAll(' ', '');
const repositoryDefaultBranch = (await question('Repository default branch ? (no spaces | default: main) ')).replaceAll(' ', '') || 'main';
const publicKey = (await question('Public key ?'));

const userName = `git_${repositoryName}`;

await $`sudo adduser ${userName}`;
await $`su ${userName}`;
cd('~');
await fs.mkdir('.ssh');
await fs.chmod('.ssh', '700');
await fs.createFile('.ssh/authorized-keys');
await fs.chmod('.ssh', '600');

await fs.appendFile('.ssh/authorizedKeys', publicKey);

await fs.mkdir(`${repositoryPath}/${repositoryName}.git`);
cd(`${repositoryPath}/${repositoryName}.git`);
await $`git init --bare`;
await $`git checkout -b ${repositoryDefaultBranch}`;

echo`Git server configured. You can connect with :`;
echo` - repository: ${repositoryPath}/${repositoryName}`;
echo` - username : ${userName}`;
echo` - branch : ${repositoryDefaultBranch}`;
