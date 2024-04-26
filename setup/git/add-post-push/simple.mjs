#!/usr/bin/env zx

import { displayDescription } from '../../lib/textHelpers.mjs';

displayDescription(
	`This script will add a post-push hook to run a build command in a git repository.`,
	`It's useful if you want a simple push repo with an auto-deployment feature.`,
	`By default, post-push hook will use this file in your repo : <root_folder>/hooks/on-post-receive.sh \n`,
);

const repositoryPath = (await question('Repository path ? (default: ~/repo.git) ')) || '~/repo.git';
const targetPath = (await question('Deployment path ? (default: ~/repo) ')) || '~/repo';
const branchToDeploy = (await question('Branch to deploy ? (default: main) ')) || 'main';

cd(repositoryPath);

await fs.appendFile(`./hooks/post-receive`, `#!/bin/bash

TARGET="${targetPath}"
GIT_DIR="${repositoryPath}"
BRANCH="${branchToDeploy}"

while read oldrev newrev ref
do
\t# only checking out the master (or whatever branch you would like to deploy)
\tif [ "$ref" = "refs/heads/$BRANCH" ];
\tthen
\t\tcd ~
\t\techo "Ref $ref received. Deploying \${BRANCH} branch to production..."
\t\tmkdir ${targetPath}
\t\tgit --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH
\t\tcd ${targetPath}
\t\t./hooks/on-post-receive.sh
\telse
\t\techo "Ref $ref received. Doing nothing: only the \${BRANCH} branch may be deployed on this server."
\tfi
done
`);

await $`chmod +x ./hooks/post-receive`;

echo`Git server updated. Start with :`;
echo` - deploy file : <project_root_folder>/hooks/on-post-receive.sh`;
