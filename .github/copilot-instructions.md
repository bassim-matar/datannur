# GitHub Copilot Instructions - datannur

## Project Structure

**datannur**### 5. Handle Optional/Nullable Values

- **ALWAYS** handle `undefined` and `null` cases with:
  - Nullish coalescing: `value ?? defaultValue`
  - Optional chaining: `obj?.prop?.nested`
  - Type guards when needed: `if (value !== undefined)`
- **NEVER** ignore optional properties - handle them explicitly and concisely

### 6. No Type Workarounds

- **NEVER** use `any`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` to bypass TypeScript errorsble client-side data catalog that runs without a server. Key architectural aspects:

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

## TypeScript Best Practices - ALWAYS PRIORITIZE THESE SOLUTIONS

### 1. Prefer Concise Built-in Solutions

- **ALWAYS prefer** nullish coalescing (`??`), optional chaining (`?.`), and modern operators over verbose checks
- **Example**: Use `arr.flatMap(x => x.items ?? [])` instead of `arr.flatMap(x => x.items).filter(x => x !== undefined)`
- **Example**: Use `value ?? defaultValue` instead of `value !== undefined ? value : defaultValue`

### 2. Prefer Concise Type Syntax

- **ALWAYS prefer** `T[]` over `Array<T>` for arrays
- **ALWAYS prefer** `{ [key: string]: Type }` over `Record<string, Type>` for object types
- **Example**: Use `string[]` instead of `Array<string>`
- **Example**: Use `{ [id: string]: number }` instead of `Record<string, number>`
- **Example**: Use `(Entity & { extra: string })[]` instead of `Array<Entity & { extra: string }>`

### 3. Fix Types at the Source

- **ALWAYS** fix type definitions at their source rather than adding casts or workarounds at usage sites
- **Example**: If `UserData` values are wrong, fix the interface definition, not cast everywhere
- **Example**: Use generics to preserve types through function chains rather than casting results

### 4. Type Safety Without Casts

- **AVOID** type assertions (`as Type`) - they bypass type checking
- **PREFER** type guards, narrowing, and proper type definitions
- **USE** generics to preserve type information through transformations
- **Example**: `function removeDuplicateById<T extends MainEntity>(items: T[]): T[]` preserves exact type

### 5. Handle Optional/Nullable Values

- **ALWAYS** handle `undefined` and `null` cases with:
  - Nullish coalescing: `value ?? defaultValue`
  - Optional chaining: `obj?.prop?.nested`
  - Type guards when needed: `if (value !== undefined)`
- **NEVER** ignore optional properties - handle them explicitly and concisely

### 5. No Type Workarounds

- **NEVER** use `any`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` to bypass TypeScript errors
