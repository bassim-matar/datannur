# GitHub Copilot Instructions - datannur

## Project Structure

**datannur** is a portable client-side data catalog that runs without a server. Key architectural aspects:

- **Svelte 5 + TypeScript + Vite** stack with custom plugins
- **Client-side database**: Uses jsonjsdb (.json.js files) for browser-based relational data
- **Standard Vite structure**: Development in `/src/` → Build to `/app/` (custom outDir)
- **Auto-generated routing**: Routes created from `src/page/*.svelte` files
- **Portable deployment**: Single HTML entry point, no server dependencies

### Core directories:

- `src/component/` - Reusable Svelte components organized by data concepts (dataset, folder, tag, etc.)
- `src/page/` - Main application pages (auto-generates router)
- `src/datatable/` - DataTables.js integration for data grids
- `src/frame/` - UI framework components (Header, Footer, Router)
- `public/` - Vite public directory (static assets, user data)
- `public/data/` - User data folder (only folder users modify)
- `public/data/db/` - Database files in jsonjsdb format (.json.js)

### Key files:

- `src/db.ts` - Database wrapper and schema definitions
- `src/db-schema.json` - Complete database schema documentation
- `vite.config.ts` - Custom build configuration with auto-generation plugins

## Code Comments Policy

- Add comments ONLY when absolutely necessary
- All comments must be written in English ONLY
- Never use any other language in comments
- Focus on explaining "why", not "what"
- Document only non-obvious business logic or complex algorithms

## Code Quality Standards

- **Clean & Professional**: Write clean, maintainable code that follows industry best practices
- **Standard Compliance**: Adhere to TypeScript and JavaScript standards consistently
- **Concise & Clear**: Keep code concise while maintaining readability and clarity
- **No Duplication**: Avoid code duplication - extract common logic into reusable functions
- **Simple & Readable**: Prioritize simplicity and readability over complex abstractions
- **Type Safety**: Use proper TypeScript types - avoid `any` type
- **Consistent Naming**: Use clear, descriptive names for variables, functions, and classes
- **Single Responsibility**: Each function and class should have a single, well-defined purpose
