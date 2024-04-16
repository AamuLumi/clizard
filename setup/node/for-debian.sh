sudo apt update
sudo apt install curl -y

# installs NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm
NVM_DIR="$HOME/.nvm"
\. "$NVM_DIR/nvm.sh"  # This loads nvm

# download and install Node.js
nvm install 20

echo "Here's installed node path and version. Check everything is good and node is run from nvm."

which node
node -v 

which npm
npm -v 

echo "\n\nRun these commands to load nvm in current term : "
echo "NVM_DIR=\"$HOME/.nvm\""
echo "[ -s \"$NVM_DIR/nvm.sh\" ] && $NVM_DIR/nvm.sh"

