![datannur logo](./assets/main_banner_dark.png#gh-dark-mode-only)
![datannur logo](./assets/main_banner.png#gh-light-mode-only)

# datannur

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/bassim-matar/datannur?color=blue)](https://github.com/bassim-matar/datannur/releases)

datannur is a portable data catalog that can run without a server.

> 💡 **Tip:** This is the ready-to-use application. For source code, development documentation, and contributing guidelines, see the [main repository](https://github.com/bassim-matar/datannur).

**📦 Download the app:** [Latest release](https://github.com/bassim-matar/datannur/releases/latest)

**🌐 More info:** [datannur.com](https://datannur.com)

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Updates](#updates)
  - [Automatic Update (Recommended)](#automatic-update-recommended)
  - [Manual Update](#manual-update)
- [Web Deployment](#web-deployment)
  - [URL Rewriting](#url-rewriting)
  - [Static Page Generation](#static-page-generation)

## Quick Start

1. **Download** this folder to your computer
2. **Open** the `index.html` file in your browser
3. **Explore** the demo metadata to understand how it works
4. **Replace** the demo metadata in `/data/db/` with your own

## Project Structure

Here is the top-level structure:

```
├── .htaccess             # Apache configuration (clean URLs, cache)
├── .nojekyll             # Disables Jekyll on GitHub Pages
├── CHANGELOG.md          # Change history
├── LICENSE.md            # Project license
├── README.md             # This documentation
├── index.html            # Application entry point
├── manifest.json         # PWA configuration
├── update_app.py         # Automatic update script
├── assets/               # Static assets (CSS, JS, images)
├── data/                 # ⚠️ YOUR DATA - Only folder to modify
├── static_make/          # Static generation tools
└── sync_db/              # Database synchronization
```

> **⚠️ Important:** Only the `/data/` folder should be modified by the user (adding/modifying your metadata). All other files constitute the application and should not be edited, except in exceptional cases or for advanced configuration.

## Configuration

The app uses a configuration automatically embedded in `index.html`:

```html
<div id="jsonjsdb_config" style="display:none;"
  data-app_name="dtnr"
  data-path="data/db"
  data-db_key="R63CYikswPqAu3uCBnsV"
  >
</div>
```

**Parameters:**
- **data-app_name**: Application identifier (keep as `"dtnr"`)
- **data-path**: Path to your database folder (usually `"data/db"`)
- **data-db_key**: Unique key for your data instance (generate new one if needed)

> **Note:** When using the automatic update script, this configuration is automatically preserved. For manual updates, ensure this configuration block remains in `index.html`.

## Updates

### Automatic Update (Recommended)

If you have Python installed, you can update automatically:

```bash
python3 update_app.py
```

**Configuration options** in `data/update_app.json`:
- **target_version**: Choose `"latest"` (stable), `"pre-release"` (newest), or specific version `"x.x.x"`
- **include**: List of files/folders to update

### Manual Update

If you don't have Python, you can:
1. Download the latest version from [Latest release](https://github.com/bassim-matar/datannur/releases/latest)
2. Replace the old files with new ones
3. Keep your `/data/` folder to preserve your data

## Web Deployment

For public web deployment with SEO optimization and clean URLs:

### URL Rewriting

The included `.htaccess` file enables:
- **Clean URLs**: `/dataset/123` instead of `#/dataset/123`
- **Static page fallback**: Serves pre-generated HTML when available
- **HTTPS redirect**: Automatic redirect to secure connection
- **Caching**: Optimized cache headers for assets

### Static Page Generation

Generate SEO-friendly static pages:

```bash
node static_make/js/make.js      # JavaScript version
python3 static_make/py/make.py   # Python version
```

**Configuration** in `data/static_make_config.json`:
- **domain**: Your public domain (e.g., `"https://yourdomain.com"`) - required for sitemap generation when `index_seo: true`
- **index_seo**: `true` to allow search engine indexing, `false` to add `noindex` meta tag (default: `false`)
- **entities**: Which entity types to generate static pages for
- **routes**: Which routes to pre-generate

> **Note:** This setup requires an Apache server with mod_rewrite enabled. Static generation creates SEO-optimized HTML files while maintaining the full SPA functionality.
