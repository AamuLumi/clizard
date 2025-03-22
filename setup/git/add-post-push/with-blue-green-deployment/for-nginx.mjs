#!/usr/bin/env zx

// Highly inspired by https://medium.com/@feyzilim/blue-green-deployments-for-next-js-using-pm2-nginx-and-github-22cae8893af7

import { displayDescription } from '../../../../lib/textHelpers.mjs';
import { askUser } from '../../../../lib/interactions.mjs';

displayDescription(
	`This script will add a post-push hook to run a build command in a git repository.`,
	`It's useful if you want a simple push repo with an auto-deployment feature.`,
	`By default, post-push hook will use this file in your repo : build.sh and deploy.sh/deploy.config.json.\n`,
	'Deploy script can be a .sh file (script launched in pm2) or a .config.json file (pm2 configuration to start).\n',
);

const repositoryPath = (await askUser('Repository path ?', { defaultValue: '~/repo.git' }));
const blueTargetPath = (await askUser('Blue deployment path ?', { defaultValue: '~/blue' }));
const bluePort = (await askUser('Blue port ?', { defaultValue: 31700, answerType: 'number' }));
const greenTargetPath = (await askUser('Green deployment path ?', { defaultValue: '~/green' }));
const greenPort = (await askUser('Green port ?', { defaultValue: 31701, answerType: 'number' }));
const nginxConfigurationPath = (await askUser('nginx configuration path ?', { defaultValue: '/etc/nginx/sites-available/repo' }));
const branchToDeploy = (await askUser('Branch to deploy ?', { defaultValue: 'main' }));
const envFileForDeployment = (await askUser('.env path to load for deployment ?', { defaultValue: '.env' }));
const hooksFolder = (await askUser('Hooks folder ?', { defaultValue: './hooks' }));

cd(repositoryPath);

await fs.appendFile(`./hooks/post-receive`, `#!/bin/bash

source ~/.bashrc

BLUE_DIR=${blueTargetPath}
BLUE_PORT=${bluePort}
GREEN_DIR=${greenTargetPath}
GREEN_PORT=${greenPort}
GIT_DIR="${repositoryPath}"
BRANCH="${branchToDeploy}"
NGINX_CONFIGURATION_PATH="${nginxConfigurationPath}"
ENV_FILE="${envFileForDeployment}"
HOOKS_FOLDER="${hooksFolder}"

CURRENT_PORT=$(grep -oP 'proxy_pass http://localhost:\\K\\d+' $NGINX_CONFIGURATION_PATH)
OLD_NAME=""
TARGET_DIR=""
TARGET_PORT=""
ENV_NAME=""

while read oldrev newrev ref
do
\t# only checking out the master (or whatever branch you would like to deploy)
\tif [ $ref = "refs/heads/$BRANCH" ];
\tthen
\t\tif [ $CURRENT_PORT == $BLUE_PORT ]; then
\t\t\tTARGET_DIR=$GREEN_DIR
\t\t\tTARGET_PORT=$GREEN_PORT
\t\t\tOLD_NAME=\${BLUE_DIR##*/}
\t\t\tENV_NAME=green
\t\telse
\t\t\tTARGET_DIR=$BLUE_DIR
\t\t\tTARGET_PORT=$BLUE_PORT
\t\t\tOLD_NAME=\${GREEN_DIR##*/}
\t\t\tENV_NAME=blue
\t\tfi
\t\t
\t\tcd ~
\t\t
\t\techo "Ref $ref received. Deploying \${BRANCH} branch to production on \${TARGET_PORT} (env \${ENV_NAME})..."
\t\tmkdir \${TARGET_DIR}
\t\tgit --work-tree=$TARGET_DIR --git-dir=$GIT_DIR checkout -f $BRANCH
\t\tcd \${TARGET_DIR}
\t\texport $(grep -v '^#' \${ENV_FILE} | xargs -d '\n')
\t\t
\t\techo "Load env from \${ENV_FILE}"
\t\texport PORT=$TARGET_PORT DIR=$TARGET_DIR
\t\t
\t\techo "Running build.sh hook"
\t\tchmod +x \${HOOKS_FOLDER}/build.sh
\t\t\${HOOKS_FOLDER}/build.sh
\t\t
\t\techo "Stopping PM2 target \${TARGET_NAME}"
\t\tTARGET_NAME=\${TARGET_DIR##*/}
\t\tpm2 stop $TARGET_NAME
\t\tpm2 delete $TARGET_NAME
\t\t
\t\techo "Running deploy.sh through PM2 start"
\t\tif [ -f "$HOOKS_FOLDER/deploy.config.js" ]; then
\t\t\tpm2 start \${HOOKS_FOLDER}/deploy.config.js --only "$TARGET_NAME" || pm2 restart $TARGET_NAME
\t\telse
\t\t\tpm2 start \${HOOKS_FOLDER}/deploy.sh --name "$TARGET_NAME" || pm2 restart $TARGET_NAME
\t\tfi
\t\t
\t\techo "Stopping old environment in PM2 ($OLD_NAME)..."
\t\tpm2 stop $OLD_NAME
\t\tpm2 delete $OLD_NAME
\t\t
\t\techo "Saving PM2 environment"
\t\tpm2 save
\t\t
\t\tSTATUS_CODE=0
\t\t
\t\tuntil [ $STATUS_CODE -ne 200 ]; do 
\t\t\tSTATUS_CODE=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:$TARGET_PORT)
\t\t\techo "Waiting for server to come online..."
\t\t\tsleep 3 
\t\tdone
\t\t
\t\techo "Server up ! Switching nginx to target environment..."
\t\tsed -i "s/proxy_pass http:\\/\\/localhost:[0-9]*;/proxy_pass http:\\/\\/localhost:$TARGET_PORT;/" $NGINX_CONFIGURATION_PATH
\t\tsudo systemctl restart nginx.service
\t\t
\t\techo "Deployment complete. Target environment ($TARGET_NAME) is now live!"
\tfi
done
`);

await $`chmod +x ./hooks/post-receive`;

echo`Git server updated. Start with :`;
echo` - build script : ${path.join(hooksFolder, 'build.sh')} (variables : PORT, DIR)`;
echo` - deploy script : ${path.join(hooksFolder, 'deploy.sh')} (variables : PORT, DIR) or (PM2 configuration) ${path.join(hooksFolder, 'deploy.config.json')} (variables : PORT)`;
