#!/bin/bash
REPO_URL="https://github.com/bassim-matar/datannuaire-app.git"
APP_DIR="./app"
VERSION=$(jq -r .version < package.json)
cd $APP_DIR
git tag -a "v$VERSION" -m "Release version $VERSION"
git push origin "v$VERSION"
gh release create "v$VERSION" --title "Release v$VERSION" --notes "Compiled version of the app" --target main
