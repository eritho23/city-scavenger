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

- **SvelteKit** - Application framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Bun** - Package manager and JavaScript runtime
- **Nix** - Development environments, reproducible builds, and CI/CD (with flakes enabled)
- **Sops** - Secrets management
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

### Building

```bash
# Production build (uses Nix)
nix build
```

**Important**: Nix builds only include Git-tracked files. Unstaged or uncommitted files will NOT be included in the build. If a build fails due to missing files that exist locally, they need to be staged or committed.

### GeoData Generation

The application uses `.geojson` files for game location data:

```bash
# Generate GeoData files
make geodata
```

Note: This command may fail due to Overpass API rate limiting. If this occurs, wait and retry later, or modify `OVERPASS_API_ENDPOINT` in the Makefile to use an alternative API endpoint.

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

- Follow SvelteKit best practices and file structure conventions
- Use Tailwind CSS utility classes for styling (avoid custom CSS when possible)
- Ensure all code is compatible with the Bun runtime
- Write code that will pass `nix fmt` formatting checks
- Consider suggesting `nix fmt` after generating significant code changes

## Common Commands Reference

```bash
# Development
nix develop              # Enter development shell
make dev                 # Start dev server
make geodata            # Generate GeoData files

# Building & Testing
nix build               # Build production bundle
nix flake check         # Run CI checks locally

# Code Quality
nix fmt                 # Format all files in tree
```

## File Tracking Reminder

Since Nix builds only include Git-tracked files, when creating new files that should be included in production builds, remind the user to:

1. Stage the files with `git add`
1. Or commit them with `git commit`

New files that are not tracked by Git will be silently excluded from Nix builds.
