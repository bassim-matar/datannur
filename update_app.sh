#!/bin/bash

# URL du dépôt distant pour les fichiers compilés
REPO_URL="https://github.com/bassim-matar/datannuaire-app.git"

# Chemin vers le dossier /app
APP_DIR="./app"

# Lire la version du package.json
VERSION=$(jq -r .version < package.json)

# Aller dans le dossier /app
cd $APP_DIR

# Créer un fichier .gitignore pour ignorer /static/
printf ".DS_Store\n/static/\n*.zip" > .gitignore

# Ajouter et committer les changements
git add .
git commit -m "Update compiled version $VERSION"

# Pousser les changements vers le dépôt distant
git push origin main

# Créer un tag pour la nouvelle version
git tag -a "v$VERSION" -m "Release version $VERSION"
git push origin "v$VERSION"

# Créer une release sur GitHub
gh release create "v$VERSION" --title "Release v$VERSION" --notes "Compiled version of the app" --target main
