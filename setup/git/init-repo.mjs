#!/usr/bin/env zx

import { needsRootUser } from '../../lib/conditions.mjs';
import { displayDescription } from '../../lib/textHelpers.mjs';

needsRootUser();

displayDescription(
	`This script will create a new git repository to synchronize your changes on a server.`,
);

let repositoryPath = (await question('Repository path ? (default: ~) ')) || '~';
const repositoryName = (await question('Repository name ? (no spaces) ')).replaceAll(' ', '');
const repositoryDefaultBranch = (await question('Repository default branch ? (no spaces | default: main) ')).replaceAll(' ', '') || 'main';
const publicKey = (await question('Public key ?'));

const userName = `git_${repositoryName}`;
const homePathForUser = path.join('/', 'home', userName);
const sshPathForUser = path.join(homePathForUser, `.ssh`);

if (repositoryPath.indexOf('~') === 0) {
	repositoryPath = repositoryPath.replace('~', homePathForUser);
}

await $`sudo useradd --home ${homePathForUser} -m ${userName}`;
await $`usermod -s /bin/bash --password $(echo ${userName} | openssl passwd -1 -stdin) ${userName}`;

await fs.mkdir(sshPathForUser);
await fs.chmod(sshPathForUser, '700');
await fs.createFile(path.join(sshPathForUser, 'authorized_keys'));
await fs.chmod(path.join(sshPathForUser, 'authorized_keys'), '600');

await fs.appendFile(path.join(sshPathForUser, 'authorized_keys'), `${publicKey}\n`);

await fs.mkdir(path.join(repositoryPath, `${repositoryName}.git`));
cd(path.join(repositoryPath, `${repositoryName}.git`));
await $`git init --bare`;
await $`git branch -m ${repositoryDefaultBranch}`;

await $`chown -R ${userName}:${userName} ${homePathForUser}`;
await $`chown -R ${userName}:${userName} ${repositoryPath}`;

echo`Git server configured. You can connect with :`;
echo` - repository path: ${repositoryPath}/${repositoryName}.git`;
echo` - repository name: ${repositoryName}.git`;
echo` - username : ${userName}`;
echo` - branch : ${repositoryDefaultBranch}`;
