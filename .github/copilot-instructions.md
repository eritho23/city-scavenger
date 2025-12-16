# GitHub Copilot Instructions

## Project Overview

**CityScavenger** is a SvelteKit application for a scavenger hunt game that integrates RAG-based LLM prompting to obtain place data.

## CRITICAL: Package Manager

**NEVER USE NPM UNDER ANY CIRCUMSTANCES**

This project uses **bun** exclusively for all package management and build operations. There are NO exceptions to this rule.

**DO NOT:**

- Suggest `npm install`, `npm run`, `npm ci`, or ANY `npm` commands
- Reference `package-lock.json` or npm-specific configurations
- Use npm scripts or npm-related tooling
- Suggest installing packages with npm

**ALWAYS USE:**

- `bun install` for installing dependencies
- `bun add <package>` for adding dependencies
- `bun remove <package>` for removing dependencies
- `bun run <script>` or `bun <script>` for running scripts
- `bun.lockb` as the lockfile (not package-lock.json)

If you find yourself suggesting npm, STOP and use bun instead.

## Technology Stack

- **SvelteKit** - Application framework (using **Svelte 5**)
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling framework (using Vite plugin)
- **Bun** - Package manager and JavaScript runtime
- **Kysely** - Type-safe SQL query builder for TypeScript
- **PostgreSQL** - Database (local instance in dev)
- **Valibot** - Schema validation library
- **Nix** - Development environments, reproducible builds, and CI/CD (with flakes enabled)
- **Sops** - Secrets management
- **svelte-adapter-bun** - SvelteKit adapter for Bun runtime
- **RAG-based LLM** - Place data generation for game content

## Development Workflow

### Environment Setup

This project uses Nix for reproducible development environments. All development should occur within the Nix development shell.

```bash
# Enter development environment
nix develop

# Start development server (uses Makefile)
make dev

# Format code
nix fmt

# Run CI checks locally
nix flake check
```

**Important Notes:**

- The dev shell sets `DATABASE_URL` automatically to use a local PostgreSQL instance in `./tmp`
- An alias `make='pdpmake'` is configured (POSIX-compliant make)
- The shell tries to load secrets via Sops; missing keys trigger a warning but don't block development

### Building

```bash
# Production build (uses Nix)
nix build
```

**Critical**: Nix builds only include Git-tracked files. Unstaged or uncommitted files will NOT be included in the build. If a build fails due to missing files that exist locally, they need to be staged or committed.

### Database Management

The project uses PostgreSQL with Kysely query builder and type-safe database access.

```bash
# Start PostgreSQL (auto-started by `make dev`)
make postgres

# Access database shell
make psql

# Run migrations
make migrate-up
make migrate-down

# Regenerate TypeScript types from database schema
bun run db:generate
```

**Database Architecture:**

- Local PostgreSQL instance runs in `./tmp/.pgdata` with Unix socket in `./tmp`
- Migrations live in `migrations/` directory (numbered SQL files)
- Database types auto-generated to [src/lib/generated/db.d.ts](../src/lib/generated/db.d.ts) via `kysely-codegen`
- Database connection configured in [src/lib/database.ts](../src/lib/database.ts) using Kysely
- Schema validation uses Valibot (see [src/lib/schemas.ts](../src/lib/schemas.ts))

### GeoData Generation

The application uses `.geojson` files for game location data from Overpass API:

```bash
# Generate GeoData files
make geodata
```

**Process:**

1. Queries in `queries/*.query` sent to Overpass API
1. Results saved to `generated/*.geojson`
1. Python script merges bus stops (`scripts/merge_busstops.py`)

Note: This command may fail due to Overpass API rate limiting. If this occurs, wait and retry later, or modify `OVERPASS_API_ENDPOINT` in [mk/geodata.mk](../mk/geodata.mk) to use an alternative API endpoint.

## Project-Specific Considerations

### Secrets Management

- Project uses Sops for secrets management
- New developers need to obtain Sops-compatible keys from @eritho23
- If you see messages about Sops keys during `nix develop`, contact @eritho23

### First-time Setup

- Initial `nix develop` may take significant time as software is downloaded and compiled
- This is normal behavior for Nix-based projects

### Makefile Usage

- Project uses Make for common development tasks
- Prefer suggesting Makefile targets (`make dev`, `make geodata`) over direct commands when available
- Check the Makefile for available targets before suggesting manual command sequences

### Nix Flakes

- This is a Nix flakes project
- Users must have `nix-command` and `flakes` enabled in their Nix configuration
- All builds and development environments are managed through flakes

## Coding Conventions

When generating code for this project:

- **Use Svelte 5 syntax exclusively** - This includes runes (`$state`, `$derived`, `$effect`, `$props`), snippets, and the new event handling syntax
- Follow SvelteKit best practices and file structure conventions
- Use Tailwind CSS utility classes for styling (avoid custom CSS when possible)
- Ensure all code is compatible with the Bun runtime
- Write code that will pass `nix fmt` formatting checks
- Consider suggesting `nix fmt` after generating significant code changes

### Svelte 5 Specifics

- Use runes for reactivity: `$state()`, `$derived()`, `$effect()`
- Use `$props()` for component props instead of `export let`
- Use snippets (`{#snippet name()}...{/snippet}`) instead of slots where appropriate
- Event handlers use `onclick` instead of `on:click` (lowercase, no colon)
- No stores are needed for local component state - use `$state()` instead

## Common Commands Reference

```bash
# Development
nix develop              # Enter development shell
make dev                 # Start dev server (installs deps, starts postgres, runs migrations, generates types)
make geodata            # Generate GeoData files

# Database
make postgres            # Start PostgreSQL instance
make psql                # Access database shell
make migrate-up          # Run migrations
make migrate-down        # Rollback migrations
bun run db:generate      # Generate TypeScript types from schema

# Building & Testing
nix build               # Build production bundle
nix flake check         # Run CI checks locally

# Code Quality
nix fmt                 # Format all files in tree
bun run check           # Run svelte-check and eslint
```

## File Tracking Reminder

Since Nix builds only include Git-tracked files, when creating new files that should be included in production builds, remind the user to:

1. Stage the files with `git add`
1. Or commit them with `git commit`

New files that are not tracked by Git will be silently excluded from Nix builds.
