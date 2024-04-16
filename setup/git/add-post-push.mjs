#!/usr/bin/env zx

import { displayDescription } from '../../lib/textHelpers.mjs';

displayDescription(
	`This script will add a post-push hook to run a build command in a git repository.`,
	`It's useful if you want a simple push repo with an auto-deployment feature.`,
	`By default, post-push hook will use this file in your repo : <root_folder>/hooks/on-post-receive.sh \n`,
);

const repositoryPath = (await question('Repository path ? (default: ~/repo.git) ')) ?? '~/repo.git';

cd(repositoryPath);

await fs.appendFile(`./hooks/post-receive`, `../../hooks/on-post-receive.sh`);
await $`chmod a+x ./hooks/post-receive`;

echo`Git server updated. Start with :`;
echo` - deploy file : <root_folder>/hooks/on-post-receive.sh`;
