#!/usr/bin/env zx

import { needsRootUser } from '../../lib/conditions.mjs';
import { displayDescription } from '../../lib/textHelpers.mjs';

needsRootUser();

displayDescription(
	`This script will disable any attempts to log with a password to the server.`,
);

const CONF_FILE_PATH = `/etc/ssh/sshd_config.d/disable_password_login.conf`;

await fs.createFile(CONF_FILE_PATH);
await fs.appendFile(CONF_FILE_PATH, `ChallengeResponseAuthentication no\nPasswordAuthentication no\nUsePAM no\n`);

$`sudo systemctl reload ssh`;

echo`Password authentication disabled for SSH.`;
echo`-> Configuration file is ${CONF_FILE_PATH}`;
