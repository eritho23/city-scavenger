# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in the CityScavenger repository.

## Project Overview

CityScavenger is a SvelteKit application for a scavenger hunt game that integrates RAG-based LLM prompting to obtain place data. The project uses modern web technologies with a focus on type safety and developer experience.

## Technology Stack

- **SvelteKit** - Application framework (using Svelte 5)
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling framework (using Vite plugin)
- **Bun** - Package manager and JavaScript runtime
- **Kysely** - Type-safe SQL query builder for TypeScript
- **PostgreSQL** - Database (local instance in dev)
- **Zod** - Schema validation library
- **Nix** - Development environments and reproducible builds
- **Sops** - Secrets management
- **svelte-adapter-bun** - SvelteKit adapter for Bun runtime

## Critical: Package Manager

**NEVER USE NPM UNDER ANY CIRCUMSTANCES**

This project uses **bun** exclusively for all package management and build operations.

**ALWAYS USE:**

- `bun install` for installing dependencies
- `bun add <package>` for adding dependencies
- `bun remove <package>` for removing dependencies
- `bun run <script>` or `bun <script>` for running scripts
- `bun.lockb` as the lockfile

## Build/Lint/Test Commands

### Development

```bash
# Enter development environment (Nix)
nix develop

# Start development server (installs deps, starts postgres, runs migrations, generates types)
make dev

# Generate GeoData files from Overpass API
make geodata
```

### Code Quality

```bash
# Format all files in tree
nix fmt

# Run svelte-check and eslint
bun run check

# Run eslint only
bun run lint

# Build production bundle
bun run build
```

### Database Management

```bash
# Start PostgreSQL instance
make postgres

# Access database shell
make psql

# Run migrations
make migrate-up
make migrate-down

# Generate TypeScript types from database schema
bun run db:generate
```

### Testing

This project currently does not have a formal test suite. When implementing tests, check the package.json for available test scripts or consult with the project maintainer.

## Code Style Guidelines

### General Principles

- Follow SvelteKit best practices and file structure conventions
- Use Tailwind CSS utility classes for styling (avoid custom CSS when possible)
- Ensure all code is compatible with the Bun runtime
- Write code that will pass `nix fmt` formatting checks

### TypeScript Configuration

- Strict TypeScript mode enabled
- Use Kysely for type-safe database operations
- Zod schemas for runtime validation (see `src/lib/schemas.ts`)
- Auto-generated database types in `src/lib/generated/db.d.ts`

### Svelte 5 Syntax Requirements

**CRITICAL: Use Svelte 5 syntax exclusively**

- **Runes for reactivity**: Use `$state()`, `$derived()`, `$effect()` instead of Svelte 4 stores
- **Component props**: Use `$props()` instead of `export let`
- **Event handlers**: Use `onclick` instead of `on:click` (lowercase, no colon)
- **Snippets**: Use `{#snippet name()}...{/snippet}` instead of slots where appropriate
- **Navigation**: Use `resolve()` for typed navigation: `<a href={resolve("/")}>...</a>`

Example patterns:

```typescript
// Component props
interface Props {
  score: number;
  time: string;
}
const { score, time }: Props = $props();

// Local state
let isLoading = $state(false);
let computedValue = $derived(() => score * 2);

// Event handlers
<button onclick={handleClick}>Click me</button>
```

### Import Organization

- Group imports: external libraries first, then internal modules
- Use `$lib/` prefix for internal imports
- Keep imports sorted alphabetically within groups

```typescript
// External libraries
import { ChevronDown } from "@lucide/svelte";
import { onMount } from "svelte";

// Internal modules  
import HDivider from "$lib/components/HDivider.svelte";
import { db } from "$lib/database";
```

### File Structure

- **Routes**: `src/routes/+page.svelte`, `src/routes/game/[gameId]/+page.svelte`
- **Components**: `src/lib/components/ComponentName.svelte`
- **Server code**: `src/lib/server/`, `src/routes/+page.server.ts`
- **Types**: `src/lib/generated/`, `src/lib/schemas.ts`
- **Database**: `src/lib/database.ts`, `migrations/`

### Database Patterns

- Use Kysely for all database operations
- Generate types with `bun run db:generate` after schema changes
- Keep migrations in `migrations/` directory with numbered prefixes
- Use Zod schemas for validation alongside database types

### Error Handling

- Use SvelteKit's `error()` function for HTTP errors
- Use `fail()` for form action failures
- Return consistent error objects with `message` field
- Handle async operations with proper error boundaries

### Naming Conventions

- **Components**: PascalCase (e.g., `QuestionsCard.svelte`)
- **Files**: kebab-case for utilities, camelCase for TypeScript files
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database tables**: snake_case

### Environment Variables

- Use `$env/dynamic/private` for server-side environment variables
- Database URL configured via `DATABASE_URL`
- Secrets managed through Sops (contact maintainer for access)

## Development Workflow

### First-time Setup

1. Ensure Nix flakes are enabled in your Nix configuration
1. Run `nix develop` to enter the development environment
1. The dev shell automatically configures `DATABASE_URL` and other environment variables

### File Tracking Reminder

Since Nix builds only include Git-tracked files, new files must be staged or committed to be included in production builds. Use `git add` or `git commit` after creating new files.

### Common Issues

- **Overpass API rate limiting**: `make geodata` may fail due to rate limits. Wait and retry or use alternative endpoint
- **Database connection**: Ensure PostgreSQL is running via `make postgres` before starting dev server
- **Type generation**: Run `bun run db:generate` after database schema changes

## Available Makefile Targets

- `make dev` - Start development server
- `make geodata` - Generate GeoData files
- `make postgres` - Start PostgreSQL
- `make psql` - Access database shell
- `make migrate-up` - Run database migrations
- `make migrate-down` - Rollback migrations
- `make clean` - Clean all generated files

## Security Considerations

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Database connections use local Unix sockets in development
- Sops manages production secrets (contact maintainer for access)
