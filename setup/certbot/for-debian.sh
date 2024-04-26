#!/bin/bash

sudo apt update
sudo apt install snapd -y
sudo snap install core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
