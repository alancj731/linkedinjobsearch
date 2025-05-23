#!/bin/bash
pwd_value=$(pwd)
echo "alias lkinsearch='cd $pwd_value && node $pwd_value/dist/src/index.js'" >> ~/.bashrc
echo "Alias 'lkinsearch' added to ~/.bashrc"
echo "Please run 'source ~/.bashrc' or restart your terminal to use it."