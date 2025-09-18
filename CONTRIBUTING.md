# Contributing to datannur

Thank you for your interest in contributing. The goal of this project is to stay **simple**, **portable**, and **client-side only**.

## Quick Start (Maintainers / Power Users)

If you want the fast workflow used in this repository:

```bash
# One-time setup (install the 'wip' alias globally)
git config --global alias.wip '!f(){ n=${1:-wip-$(date +%Y%m%d-%H%M%S)}; git switch -c "$n"; }; f'
```

Usage for each new change batch:

```bash
git checkout main
git pull
git wip                  # creates e.g. wip-20250918-153012
# ... commits ...
git push -u origin HEAD
# Open PR → wait for CI → squash merge → delete branch
```

You can also pass a custom name:

```bash
git wip search-ui
```

## Standard Contribution Flow (External Contributors)

1. Fork the repository
2. Create a branch (name freely):
   ```bash
   git checkout -b add-feature-x
   ```
3. Install dependencies:
   ```bash
   npm ci
   ```
4. Run tests locally before pushing:
   ```bash
   npm run test
   ```
5. Commit changes (clear messages preferred):
   ```bash
   git add .
   git commit -m "add dataset filter logic"
   git push origin add-feature-x
   ```
6. Open a Pull Request to `main`
7. Ensure CI (unit + UI tests) passes
8. Respond to review comments if any
9. Maintainer will squash merge

## Guidelines

### Scope of a Pull Request

Keep PRs focused. A good PR:

- Implements one feature OR fixes one bug OR refactors one logical area
- Does not mix stylistic rewrites with functional changes
- Avoids adding unused dependencies

### Tests

We run two layers:

- `test:unit` (logic / helpers)
- `test:ui` (Playwright UI smoke tests against built app)

Run everything locally:

```bash
npm run test
```

If a console error appears during UI tests, the test suite fails.

### Build

The production build is generated with:

```bash
npm run build
```

The deployed content is the `app/` directory after `vite build`.

### Commit Messages

No strict format enforced. Just be descriptive:

```
add tag search
fix crash when variable has no metadata
cleanup favorites store
```

(Conventional commits welcome but optional.)

### Linting

ESLint exists but may not be fully enforced yet. Feel free to fix lint issues incrementally. Do not introduce new obvious warnings.

### Console Errors

UI must render with **zero** browser console errors. Treat any console error as a bug.

### Performance / Footprint

- Avoid large dependencies
- Prefer small, local utilities
- Keep client bundle size reasonable

### Documentation

If you add a new visible feature, update `README.md` if needed.

## Releases

### Automated tagging via script

Prerequisites:

- `package.json` version already bumped and `CHANGELOG.md` updated
- You are on a clean `main` (no uncommitted changes)

Run:

```bash
npm run release
```

This runs `release.ts` which:

1. Verifies you are on `main`
2. Checks for uncommitted changes
3. Confirms the tag `v<version>` does not already exist
4. Creates an annotated tag `v<version>`
5. Pushes the tag (GitHub Actions `release.yml` handles the rest)

### Pre-releases

Pushes to `main` without a new version tag still deploy the build (GitHub Pages) but do **not** create a GitHub Release. Only tags `v*` trigger the release workflow logic.

### When to bump the version

- After merging a meaningful change you want to publish
- Keep version in `package.json` aligned with last tagged version

### Suggested simple flow

```bash
# 1. Edit code / merge PRs
# 2. Update version in package.json and CHANGELOG.md
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 0.X.Y"
git push
# 3. Tag via script
npm run release
```

The release workflow will extract the changelog section (if present) and attach the packaged artifact.

## CI Overview

- Pull Requests and pushes to `main` run tests.
- GitHub Pages deploys automatically on successful push to `main`.
- Release workflow activates on `v*` tags.

## Opening Issues

Provide:

- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if UI related

## Cleaning Up Local WIP Branches

After merge (squash), you can remove the branch locally and remotely:

```bash
git branch -D wip-20250918-153012
git push origin :wip-20250918-153012
```

(Usually GitHub UI delete button is enough.)
