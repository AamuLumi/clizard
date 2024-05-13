# clizard

Scripts to speed up init and deployment tasks on servers  
Written with ZX and bash

**Warning** : I'm working sporadically on this project for my personal and professional use. Scripts normally work, but
while this project isn't mature, take a look at each script code to avoid any problem.

## How to use

Clone the repository on the machine where you need it.  
Scripts paths follow the pattern : `setup/<program>/<options>/<feature>.mjs`.

## Features

### Certbot

- Install Certbot on debian ([more](/setup/certbot/for-debian.sh))

### Git

- Install a git server ([more](/setup/git/init-repo.mjs))
    - With an auto-deployment script ([more](/setup/git/add-post-push/simple.mjs))
    - With a blue-green deployment through
      nginx ([more](/setup/git/add-post-push/with-blue-green-deployment/for-nginx.mjs))

### Node

- Install node on debian through nvm ([more](/setup/node/for-debian.sh))

### SSH

- Disable password login ([more](/setup/ssh/disable-password-login.mjs))

### sudo

- Authorize a command for a user ([more](/setup/sudo/authorize_command_for_user.mjs))

## Development and testing

There's a simple script to create a debian container locally w/ Docker or Podman and link the repo as a volume.  
Run `./test/startTestContainer.sh` and execute your scripts in the container.

## Ideas for the future

- [ ] Rollback scripts

## Why ZX

Because I hate bash. Sorry sysadmins but I'm a dev with a taste for nice and modern syntax.
