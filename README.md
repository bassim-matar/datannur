![datannuaire logo](./public/data/img/main_banner_dark.png#gh-dark-mode-only)
![datannuaire logo](./public/data/img/main_banner.png#gh-light-mode-only)

# datannuaire

Datannuaire is a portable data catalog able to run without any server.

This repo is proprietary code with source available. Please check the full [License](License) before any usage or contribution.
[Jsonjsdb](https://github.com/bassim-matar/jsonjsdb) is the main library that makes the app running without server,
and this one is open source and can be used to build any other app.

## Why

datannuaire, the portable data catalog

Allows you to **centralize**, **search** and **visualize** information across a collection of datasets

Aims to improve data organization and to ease their **sharing** and **documentation**

**Simple** and **flexible**, quickly integrates into all types of environments

- **Easy** :
No installation or configuration required, free of cost or technical prerequisites

- **Portable** :
Operates anywhere (local, cloud, shared disk), simply a folder that can be copied, moved, sent, and opened with any web browser

- **Complete** :
Versatile, thorough, and structured around 6 concepts with significant detail: Institution, Folder, Keyword, Dataset, Variable, and Modality

- **Independent** :
The catalog is just an interface for viewing metadata; the creation and update process is independent and under your control

- **Secure** :
Thanks to the strict separation between systems, the application is isolated within the browser, cannot alter the machine, and therefore poses no risk


## Tech stack

The app is a SPA 100% client-side using [Svelte](https://github.com/sveltejs/svelte) as the main framework
and [Vite](https://github.com/vitejs/vite) for developpement and bundling.
The app depends heavily on [Datatables](https://datatables.net) and his plugins.
SCSS are also used for style and a subset of Bulma CSS has been used for some components. You can check the package.json to see all dependencies.

## Usage

1. Download the repo
2. Run `npm install`

- Run `npm run dev` to start the dev server
- Run `npm run build` to build the production app
- Run `npm run preview` to view the production app


