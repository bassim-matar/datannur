![datannur logo](./public/assets/main_banner_dark.png#gh-dark-mode-only)
![datannur logo](./public/assets/main_banner.png#gh-light-mode-only)

# datannur

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/bassim-matar/datannur?color=blue)](https://github.com/bassim-matar/datannur/releases)

datannur is a portable data catalog that can run without a server.

If you're looking for the built version of the app, you can find it in this repository: [datannur-app](https://github.com/bassim-matar/datannur-app).

For more information check [datannur.com](https://datannur.com).

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Architecture](#architecture)
  - [Data Model](#data-model)
  - [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Scripts](#scripts)
  - [Code Style & Conventions](#code-style--conventions)
  - [Release Process](#release-process)
  - [Contributing](#contributing)
- [License](#license)

## Overview

datannur is a client-side data catalog designed to organize and explore datasets without requiring server infrastructure.

**Key features:**
- **Zero-config deployment** - Single entry point (index.html) that runs in any browser
- **Portable** - Works locally, on shared drives, or cloud storage
- **Comprehensive metadata** - Structured around 7 core concepts: Institution, Folder, Tag, Doc, Dataset, Variable, and Modality
- **Browser-isolated** - No system access, inherently secure

## Demo

🚀 **[Try the live demo](https://bassim-matar.github.io/datannur/)**

![datannur interface](./public/assets/about_page/dossier_sitg_tab_dataset_dark.webp#gh-dark-mode-only)
![datannur interface](./public/assets/about_page/dossier_sitg_tab_dataset.webp#gh-light-mode-only)

## Architecture

### Data Model
The catalog is built around 7 core concepts organized in two categories:

**Inside the dataset:**
- **Dataset** - Data tables (database, Excel, CSV) with rows (observations) and columns (variables)
- **Variable** - Individual data fields within datasets, can be categorical with defined modalities
- **Modality** - Set of possible values for categorical variables, with descriptions for each value

**Outside the dataset:**
- **Folder** - Hierarchical organization of datasets and modalities in nested folder structures
- **Institution** - Organizations with two roles: Provider (data producer) and Manager (data maintainer)
- **Tag** - Keywords for cross-cutting themes and categories, can be hierarchically organized
- **Doc** - Markdown or PDF documentation that can be associated with multiple concepts

These concepts are highly interconnected, providing flexible data organization, enrichment, and documentation capabilities.

### Project Structure
```
src/
├── App.svelte           # Main application component
├── main.js              # Application entry point
├── main.scss            # Main stylesheet with color themes and variables
├── db.js                # Database instance (Jsonjsdb wrapper)
├── db_schema.json       # Complete schema documentation for all database tables
├── .generated/          # Auto-generated files (router, etc.)
├── app_mode/            # Application mode components
├── component/           # Reusable Svelte components
│   ├── dataset/         # Dataset-specific components
│   ├── folder/          # Folder management components
│   └── ...
├── dark_mode/           # Dark mode functionality
├── datatable/           # DataTables integration and utilities
├── favorite/            # Bookmark/favorites system
├── frame/               # UI framework components (Header, Footer, etc.)
├── img/                 # Image assets
├── js/                  # JavaScript utilities
├── layout/              # Layout components
├── markdown/            # Markdown content files
├── page/                # Main application pages
├── search/              # Search functionality
├── stat/                # Statistics at the column level
├── style/               # Additional stylesheets
└── tab/                 # Tab components
```

## Tech stack

**Frontend Framework:**
- [Svelte](https://github.com/sveltejs/svelte) - Main UI framework
- [Vite](https://github.com/vitejs/vite) - Build tool and development server

**Core Libraries:**
- [Jsonjsdb](https://github.com/bassim-matar/jsonjsdb) - Client-side JSON database
- [DataTables](https://datatables.net) - Interactive data tables with jQuery
- [FlexSearch](https://github.com/nextapps-de/flexsearch) - Full-text search engine
- [Navigo](https://github.com/krasimir/navigo) - Client-side router

**UI & Styling:**
- SCSS - CSS preprocessor
- [Bulma](https://github.com/jgthms/bulma) (subset) - CSS framework components
- [Font Awesome](https://fontawesome.com) - Icon library

**Documentation & Content:**
- [Marked](https://github.com/markedjs/marked) - Markdown parser
- [Mermaid](https://github.com/mermaid-js/mermaid) - Diagram generation

**Utilities:**
- [JSZip](https://github.com/Stuk/jszip) - ZIP file handling
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - File download functionality

## Getting Started

### Usage

1. Download the repo
2. Run `npm install`
3. Run `npm run dev` to start developing

For more commands, see the Scripts section below.

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Open built app with file:// protocol
- `npm run serve` - Serve built app on localhost
- `npm run test` - Run test suite with Vitest
- `npm run release` - Create and publish release
- `npm run static-make-js` - Build + generate static pages for SEO (JS version)
- `npm run static-make-py` - Build + generate static pages for SEO (Python version)

### Code Style & Conventions

- **Variables & functions:** `snake_case`
- **Components:** `PascalCase` for Svelte files
- **Import aliases:** Use path shortcuts - `@js/`, `@component/`, `@db`, `@layout/` (see `jsconfig.json`)
- **Svelte 5 patterns:** Use `$props()`, `$state()`, `$derived()` for reactivity
- **Database access:** Import `db` from `@db` for all data operations
- **Minimal comments** - Self-documenting code with clear naming

### Release Process
```bash
npm run release
```

The release script automatically:
- Extracts changelog from `CHANGELOG.md`
- Creates a git tag with the version from `package.json`
- Pushes the tag to GitHub
- Creates GitHub releases for both development and app repositories

### Contributing

Contributions to datannur are always welcome. Whether it's a bug report, new feature, or improvement to existing features, your input is highly appreciated.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test them
4. Update `CHANGELOG.md` with your changes
5. Commit using clear, descriptive messages
6. Push to your fork and submit a pull request

## License

MIT - see [LICENSE](LICENSE). All dependencies are MIT/Apache 2.0/BSD compatible.
