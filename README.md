# CityScavenger

This repository contains the SvelteKit application for the CityScavenger game.
It integrates RAG-based LLM prompting to obtain place data for the game.

## Development environment

For the development environment, we **strongly** recommend using
[Nix](https://nixos.org/download). By using Nix, we can ensure a consistent
development environment as well as reproducible builds. Since we use
[flakes](https://wiki.nixos.org/wiki/Flakes), you need to enable
`nix-command` and `flakes` in your Nix configuration.

### Entering a development shell

Simply run

```
nix develop
```

to enter a complete developer environment.

> [!NOTE]
> The first time, entering the development environment may take a little while, since the software needed will need to be downloaded and compiled.

### Building a bundle for production

Simply run

```
nix build
```

to build the production bundle.

> [!IMPORTANT]
> If the build fails due to missing files, and said files are not tracked in git, you need to stage or commit them in order for them to appear during the build.

### Formatting

To format all files in the tree, one may simply run

```
nix fmt
```

and commit the result.

### Running CI locally

In CI, the used command is

```
nix flake check
```

and one may see if CI will pass by running the command.

## Generating GeoData files

To generate `.geojson` files for the app, run

```
make geodata
```

and wait for it to succeed.

> [!TIP]
> If it does not work, you may have been rate limited. Try later or try changing `OVERPASS_API_ENDPOINT` in `Makefile` to another compatible API endpoint.
