#!/usr/bin/env zx

import { needsRootUser } from '../../lib/conditions.mjs';
import { displayDescription } from '../../lib/textHelpers.mjs';
import { askUser } from '../../lib/interactions.mjs';

needsRootUser();

displayDescription(
	`This script will add a command as usable by a user (editing the sudoers file).`,
);

const user = (await askUser('User ?', { noEmpty: true }));
const command = (await askUser('Command ?', { noEmpty: true }));
const filename = (await askUser('Filename ?', { defaultValue: `authorized-command-for-${user}` }));

const CONF_FILE_PATH = `/etc/sudoers.d/${filename}`;

await fs.createFile(CONF_FILE_PATH);
await fs.appendFile(CONF_FILE_PATH, `${user} ALL=NOPASSWD: ${command}`);

echo`Command now authorized for ${user}.`;
echo`-> Configuration file is ${CONF_FILE_PATH}`;
