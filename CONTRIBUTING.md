# Contributing to datannur

- [Getting Started](#getting-started)
  - [Standard Workflow](#standard-workflow)
  - [Quick Workflow (WIP branches)](#quick-workflow-wip-branches)
  - [Git Setup (Optional)](#git-setup-optional)
- [Development Scripts](#development-scripts)
  - [Core Development](#core-development)
  - [Quality Checks](#quality-checks)
- [Guidelines](#guidelines)
  - [Pull Requests](#pull-requests)
  - [Tests & Quality](#tests--quality)
  - [Documentation](#documentation)
- [Project Architecture](#project-architecture)
  - [Tech Stack](#tech-stack)
  - [Key Directories](#key-directories)
- [Releases & Maintenance](#releases--maintenance)
  - [Release Process](#release-process)
  - [Maintainer Commands](#maintainer-commands)
  - [Branch Cleanup](#branch-cleanup)
- [Support](#support)

## Getting Started

### Standard Workflow

1. Fork the repository and create a branch:

   ```bash
   git checkout -b add-feature-x
   npm ci
   ```

2. Develop and test:

   ```bash
   npm run dev    # Start development server
   npm run test   # Run tests before pushing
   ```

3. Submit your changes:

   ```bash
   git add .
   git commit -m "add dataset filter logic"
   git push origin add-feature-x
   ```

4. Open a Pull Request to `main` - ensure CI passes

### Quick Workflow (WIP branches)

For faster iterations, you can optionally install the WIP alias:

```bash
# Optional one-time setup
git config --global alias.wip '!f(){ n=${1:-wip-$(date +%Y%m%d-%H%M%S)}; git switch -c "$n"; }; f'
```

Then for each change:

```bash
git checkout main
git pull
git wip add-feature-x       # creates branch add-feature-x
# ... commits ...
git push -u origin HEAD
# Open PR → CI → squash merge → delete branch
```

Without the alias, simply use: `git checkout -b add-feature-x`

### Git Setup (Optional)

For better branch management, you can optionally configure these Git aliases:

```bash
# One-time setup for automatic branch pruning
git config --global fetch.prune true

# Add cleanup alias for merged branches
# Add cleanup alias for squash merged branches
git config --global alias.cleanup '!f(){ current=$(git branch --show-current); if [ "$current" != "main" ] && [ "$current" != "master" ]; then git checkout main && git pull --ff-only && git branch -D "$current"; else git checkout main && git pull --ff-only; fi; }; f'
```

Then use `git cleanup` to automatically switch to main, pull changes, and delete the current branch.

## Development Scripts

### Core Development

| Command           | Purpose                     |
| ----------------- | --------------------------- |
| `npm run dev`     | Development server          |
| `npm run build`   | Build for production        |
| `npm run preview` | Open built app (file://)    |
| `npm run serve`   | Serve built app (localhost) |

### Quality Checks

| Command              | Purpose                              |
| -------------------- | ------------------------------------ |
| `npm run test`       | Run full test suite                  |
| `npm run lint`       | ESLint code analysis                 |
| `npm run type-check` | TypeScript type checking             |
| `npm run format`     | Format code with Prettier            |
| `npm run check`      | All quality checks (lint + types)    |
| `npm run verify`     | Complete verification (check + test) |

## Guidelines

### Pull Requests

Keep PRs focused - one feature, one bug fix, or one refactor. Avoid mixing stylistic changes with functional ones.

### Tests & Quality

**Before submitting a PR:**

- Run `npm run verify` (complete verification: formatting, linting, types, and tests)
- Or run individual checks:
  - `npm run check` (formatting, linting, type checking)
  - `npm run test` (unit and UI tests)

**Quality standards:**

- **Zero console errors** in browser (verified by `ui.test.ts`)
- **Clean build**: `npm run build` must pass
- **Code formatting**: Use `npm run format` to auto-format

### Documentation

Update `README.md` for new visible features.

## Project Architecture

### Tech Stack

- **Frontend**: Svelte 5 + TypeScript + Vite
- **Database**: [Jsonjsdb](https://github.com/bassim-matar/jsonjsdb) (client-side JSONJS)
- **UI**: DataTables, Bulma (subset), Font Awesome
- **Search**: FlexSearch
- **Router**: Navigo

### Key Directories

- `src/page/` - Main application pages (auto-generates router)
- `src/component/` - Reusable components by data type (dataset, folder, tag...)
- `src/datatable/` - DataTables integration
- `src/frame/` - UI framework (Header, Footer, Router)
- `public/data/` - User data (only folder users modify)
- `public/data/db/` - Database files (.json.js format)

## Releases & Maintenance

### Release Process

1. Create a release branch:

   ```bash
   git checkout main && git pull
   git checkout -b release/v0.X.Y
   ```

2. Update version and changelog:

   ```bash
   # Edit package.json and CHANGELOG.md
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 0.X.Y"
   git push -u origin release/v0.X.Y
   ```

3. Open PR → merge → automatic release:

   ```bash
   # After PR is merged, GitHub Actions automatically:
   # - Detects version change in package.json
   # - Creates git tag (v0.X.Y)
   # - Builds and packages the app
   # - Creates GitHub release with changelog
   ```

### Maintainer Commands

| Command               | Purpose                 |
| --------------------- | ----------------------- |
| `npm run static-make` | Generate SEO pages      |
| `npm run deploy`      | Deploy to remote server |

### Branch Cleanup

After PR merge, use the Git cleanup alias (see [Git Setup](#git-setup-optional)):

```bash
git cleanup  # Switches to main, pulls changes, deletes current branch
```

## Support

- **CI**: Tests run on PRs and `main` pushes
- **Deploy**: GitHub Pages auto-deploys on `main`
- **Releases**: Auto-triggered on `main` pushes when version changes
- **Pre-releases**: Auto-updated on every `main` push (for development testing)

**Bug Reports**: Provide clear title, steps to reproduce, expected vs actual behavior, screenshots if UI-related.
