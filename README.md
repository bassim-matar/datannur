![datannur logo](./public/data/img/main_banner_dark.png#gh-dark-mode-only)
![datannur logo](./public/data/img/main_banner.png#gh-light-mode-only)

# datannur

datannur is a portable data catalog able to run without any server.

This repo is proprietary code with source available. Please check the full [License](License) before any usage or contribution.
[Jsonjsdb](https://github.com/bassim-matar/jsonjsdb) is the main library that makes the app running without server,
and this one is open source and can be used to build any other app.

## Why

datannur, the portable data catalog

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

## Dependencies licences

- Font Awesome Free : Icons CC BY 4.0 License, Fonts SIL OFL 1.1 License, Code MIT License - [https://fontawesome.com/license/free](https://fontawesome.com/license/free)
- Bulma : MIT License - [https://github.com/jgthms/bulma](https://github.com/jgthms/bulma)
- DataTables : MIT License - [https://github.com/DataTables/DataTablesSrc](https://github.com/DataTables/DataTablesSrc)
- FileSaver.js : MIT License - [https://github.com/eligrey/FileSaver.js](https://github.com/eligrey/FileSaver.js)
- Fitty : MIT License - [https://github.com/rikschennink/fitty](https://github.com/rikschennink/fitty)
- FlexSearch : Apache 2.0 License - [https://github.com/nextapps-de/flexsearch](https://github.com/nextapps-de/flexsearch)
- jQuery : MIT License - [https://github.com/jquery/jquery](https://github.com/jquery/jquery)
- PowerTip : MIT License - [https://github.com/stevenbenner/jquery-powertip](https://github.com/stevenbenner/jquery-powertip)
- Jsonjsdb : MIT License - [https://github.com/bassim-matar/jsonjsdb/tree/main/jsonjsdb](https://github.com/bassim-matar/jsonjsdb/tree/main/jsonjsdb)
- JSZip : MIT License - [https://github.com/Stuk/jszip](https://github.com/Stuk/jszip)
- Marked : MIT License - [https://github.com/markedjs/marked](https://github.com/markedjs/marked)
- Mermaid : MIT License - [https://github.com/mermaid-js/mermaid](https://github.com/mermaid-js/mermaid)
- MiniMasonry.js : MIT License - [https://github.com/Spope/MiniMasonry.js](https://github.com/Spope/MiniMasonry.js)
- Page.js : MIT License - [https://github.com/visionmedia/page.js](https://github.com/visionmedia/page.js)

### Dev dependencies licences

- rollup/plugin-alias : MIT License - [https://github.com/rollup/plugins/tree/master/packages/alias#readme](https://github.com/rollup/plugins/tree/master/packages/alias#readme)
- sveltejs/vite-plugin-svelte : MIT License - [https://github.com/sveltejs/vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte)
- Autoprefixer : MIT License - [https://github.com/postcss/autoprefixer](https://github.com/postcss/autoprefixer)
- Jsonjsdb_editor : MIT License - [https://github.com/bassim-matar/jsonjsdb/tree/main/jsonjsdb_editor](https://github.com/bassim-matar/jsonjsdb/tree/main/jsonjsdb_editor)
- open-cli : MIT License - [https://github.com/sindresorhus/open-cli](https://github.com/sindresorhus/open-cli)
- Puppeteer: Apache 2.0 License - [https://github.com/puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)
- Rollup Plugin Visualizer : MIT License - [https://github.com/btd/rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)
- Sass : MIT License - [https://github.com/sass/sass](https://github.com/sass/sass)
- sitemap : MIT License - [https://github.com/ekalinin/sitemap.js](https://github.com/ekalinin/sitemap.js)
- Svelte : MIT License - [https://github.com/sveltejs/svelte](https://github.com/sveltejs/svelte)
- Svelte Preprocess : MIT License - [https://github.com/sveltejs/svelte-preprocess](https://github.com/sveltejs/svelte-preprocess)
- Vite : MIT License - [https://github.com/vitejs/vite](https://github.com/vitejs/vite)
- vite-plugin-full-reload : MIT License - [https://github.com/ElMassimo/vite-plugin-full-reload](https://github.com/ElMassimo/vite-plugin-full-reload)
- Vitest : MIT License - [https://github.com/vitest-dev/vitest](https://github.com/vitest-dev/vitest)
