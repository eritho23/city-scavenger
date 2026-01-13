# CityScavenger

This repository contains the SvelteKit application for the CityScavenger game.
It utilizes LLM generation with structured output to obtain place data for the game.

## What currently works

[X] Creating games and viewing game history.
[X] Keeping track of game score and time spent.
[X] Initial _radar_ and _relative_ question categories.
[X] Map markings on the map for _radar_ and _relative_ questions.
[X] A basic place profile with some aspects, though not necessarily completly accurate.

[X] Advanced Continuous Integration pipeline, which lints, checks formatting and types, and ensures the project is buildable in a non-developer environment.
[X] NixOS module which configures a Linux system for deploying this app along with its dependencies to production. Any NixOS system flake may use this repo as an input in order to host.

## What we want to add

[ ] More question categories, including _photo questions_ and _precise questions_.
[ ] For the aformetioned new categories, add _more accurate data_ by integrating RAG into the LLM prompt.
[ ] Implement a _guess place_ win condition.
[ ] Use a local YOLO model in the browser to add _curses_, which require a player to photograph a certain object.

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

> [!IMPORTANT]
> If you see a message about Sops keys, you need to obtain a Sops-compatible key. Contact @eritho23 for further instructions.

> [!NOTE]
> The first time, entering the development environment may take a little while, since the software needed will need to be downloaded and compiled.

### Running a development server

Run

```
make dev
```

to start a development server with necessary options.

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

## Updating GeoData files

To update `.geojson` files for the app, run

```
make geodata
```

and wait for it to succeed.

> [!TIP]
> If it does not work, you may have been rate limited. Try later or try changing `OVERPASS_API_ENDPOINT` in `Makefile` to another compatible API endpoint.
