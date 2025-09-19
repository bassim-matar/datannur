# Contributing to datannur

- [Getting Started](#getting-started)
  - [Standard Workflow](#standard-workflow)
  - [Quick Workflow (WIP branches)](#quick-workflow-wip-branches)
- [Development Scripts](#development-scripts)
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
git config --global alias.cleanup "!git checkout main && git pull --ff-only && git remote prune origin && git branch --merged | sed 's/^\* //' | grep -x -v -E 'main|master' | xargs -n 1 git branch -d"
```

Then use `git cleanup` to automatically clean up merged branches.

## Development Scripts

| Command           | Purpose                     |
| ----------------- | --------------------------- |
| `npm run dev`     | Development server          |
| `npm run build`   | Build for production        |
| `npm run test`    | Run test suite              |
| `npm run preview` | Open built app (file://)    |
| `npm run serve`   | Serve built app (localhost) |

## Guidelines

### Pull Requests

Keep PRs focused - one feature, one bug fix, or one refactor. Avoid mixing stylistic changes with functional ones.

### Tests & Quality

- Run `npm run test` locally (includes unit + UI tests)
- **Zero console errors** in browser - automatically verified by `ui.test.ts`
- Build must pass: `npm run build`

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

3. Open PR → merge → tag:

   ```bash
   # After PR is merged:
   git checkout main && git pull
   npm run release
   ```

### Maintainer Commands

| Command               | Purpose                 |
| --------------------- | ----------------------- |
| `npm run release`     | Tag and trigger release |
| `npm run static-make` | Generate SEO pages      |
| `npm run deploy`      | Deploy to remote server |

### Branch Cleanup

After PR merge, use the Git cleanup alias (see [Git Configuration](#git-configuration-recommended)):

```bash
git cleanup  # Switches to main, pulls, prunes remote, deletes merged branches
```

## Support

- **CI**: Tests run on PRs and `main` pushes
- **Deploy**: GitHub Pages auto-deploys on `main`
- **Releases**: Only `v*` tags trigger release workflow

**Bug Reports**: Provide clear title, steps to reproduce, expected vs actual behavior, screenshots if UI-related.
