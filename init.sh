#!/bin/bash

# Create directories not tracked by Git
mkdir -p data
mkdir -p secrets/service-accounts
mkdir -p exports
mkdir -p upload-doc

# Add directories to .gitignore
echo "data/" >> .gitignore
echo "secrets/service-accounts/" >> .gitignore
echo "exports/" >> .gitignore
echo "upload-doc/" >> .gitignore