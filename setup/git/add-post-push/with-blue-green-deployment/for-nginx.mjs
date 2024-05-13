#!/usr/bin/env zx

// Highly inspired by https://medium.com/@feyzilim/blue-green-deployments-for-next-js-using-pm2-nginx-and-github-22cae8893af7

import { displayDescription } from '../../../../lib/textHelpers.mjs';

displayDescription(
	`This script will add a post-push hook to run a build command in a git repository.`,
	`It's useful if you want a simple push repo with an auto-deployment feature.`,
	`By default, post-push hook will use this file in your repo : <root_folder>/hooks/on-post-receive.sh \n`,
);

const repositoryPath = (await question('Repository path ? (default: ~/repo.git) ')) || '~/repo.git';
const blueTargetPath = (await question('Blue deployment path ? (default: ~/blue) ')) || '~/blue';
const bluePort = (await question('Blue port ? (default: 31700) ')) || '31700';
const greenTargetPath = (await question('Green deployment path ? (default: ~/green) ')) || '~/green';
const greenPort = (await question('Green port ? (default: 31701) ')) || '31701';
const nginxConfigurationPath = (await question('nginx configuration path ? (default: /etc/nginx/sites-available/repo) ')) || '/etc/nginx/sites-available/repo';
const branchToDeploy = (await question('Branch to deploy ? (default: main) ')) || 'main';
const envFileForDeployment = (await question('.env file to load for deployment (default: .env) ')) || '.env';

cd(repositoryPath);

await fs.appendFile(`./hooks/post-receive`, `#!/bin/bash

source ~/.bashrc

BLUE_DIR="${blueTargetPath}"
BLUE_PORT="${bluePort}"
GREEN_DIR="${greenTargetPath}"
GREEN_PORT="${greenPort}"
GIT_DIR="${repositoryPath}"
BRANCH="${branchToDeploy}"
NGINX_CONFIGURATION_PATH="${nginxConfigurationPath}"

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
\t\t\tOLD_NAME=\${GREEN_DIR%.*}
\t\t\tENV_NAME=blue
\t\telse
\t\t\tTARGET_DIR=$BLUE_DIR
\t\t\tTARGET_PORT=$BLUE_PORT
\t\t\tOLD_NAME=\${BLUE_TARGET%.*}
\t\t\tENV_NAME=green
\t\tfi
\t\t
\t\tcd ~
\t\t
\t\techo "Ref $ref received. Deploying \${BRANCH} branch to production on \${TARGET_PORT} (env \${ENV_NAME})..."
\t\tmkdir \${TARGET_DIR}
\t\tgit --work-tree=$TARGET_DIR --git-dir=$GIT_DIR checkout -f $BRANCH
\t\tcd \${TARGET_DIR}
\t\texport PORT=TARGET_PORT DIR=TARGET_DIR
\t\t
\t\techo "Running build.sh hook"
\t\tchmod +x ./hooks/build.sh
\t\t./hooks/build.sh
\t\t
\t\techo "Stopping PM2 target \${TARGET_NAME}"
\t\tTARGET_NAME=\${TARGET_DIR%.*}
\t\tpm2 stop $TARGET_NAME
\t\tpm2 delete $TARGET_NAME
\t\t
\t\techo "Running deploy.sh through PM2 start"
\t\tpm2 start ./hooks/deploy.sh --name "$TARGET_NAME" || pm2 restart $TARGET_NAME
\t\t
\t\techo "Stopping old environment in PM2 ($OLD_NAME)..."
\t\tpm2 stop $OLD_NAME
\t\tpm2 delete $OLD_NAME
\t\t
\t\t echo "Saving PM2 environment"
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
\t\tnginx -s reload
\t\t
\t\techo "Deployment complete. Target environment ($TARGET_NAME) is now live!"
\tfi
done
`);

await $`chmod +x ./hooks/post-receive`;

echo`Git server updated. Start with :`;
echo` - build script : <project_root_folder>/hooks/build.sh (variables : PORT, DIR)`;
echo` - deploy script : <project_root_folder>/hooks/deploy.sh (variables : PORT, DIR)`;
