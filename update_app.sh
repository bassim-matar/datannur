#!/bin/bash
REPO_URL="https://github.com/bassim-matar/datannuaire-app.git"
APP_DIR="./app"
VERSION=$(jq -r .version < package.json)
cd $APP_DIR
git tag -a "$VERSION" -m "datannur $VERSION"
git push origin "$VERSION"
gh release create "$VERSION" --title "datannur $VERSION" --notes "datannur app version $VERSION" --target main
