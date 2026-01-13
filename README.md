# CityScavenger

This repository contains the SvelteKit application for the CityScavenger game.
It utilizes LLM generation with structured output to obtain place data for the game.

## The game idea

This game has been inspired by [Jet Lag: The Game](https://www.youtube.com/@jetlagthegame),
where they play geography-based "board games". Among the board games are "Hide and Seek",
which is played in entire countries, such as Switzerland or Japan. In the game, seekers
ask questions to the hider, such as "Are you north of me?" or "Are you closer to an airfield?".
The hider is awarded advantages based on the number and type of questions asked. The goal
for the seekers is to find the hider, and the goal for the hider is to have a long hiding time.

We take this concept and bring it to Västerås, and to your phone. You can play on your own
and compete against yourself, or compare yourself to others. Upon game start, LLM models
will turn unstructured data into a structured _place profile_. Based on your current location,
you can then ask questions, such as "Am i closer than 5 km?" and have the answer drawn
on the map. You might then want to move physically using bikes, walking or public transit,
in order to have a more advantageous position for your next question.

### What currently works

- [X] Creating games and viewing game history.

- [X] Keeping track of game score and time spent.

- [X] Initial _radar_ and _relative_ question categories.

- [X] Map markings on the map for _radar_ and _relative_ questions.

- [X] A basic place profile with some aspects, though not necessarily completly accurate.

- [X] Advanced Continuous Integration pipeline, which lints, checks formatting and types, and ensures the project is buildable in a non-developer environment.

- [X] NixOS module which configures a Linux system for deploying this app along with its dependencies to production. Any NixOS system flake may use this repo as an input in order to host.

### What we want to add, given more time

- [ ] More question categories, including _photo questions_ and _precise questions_.
- [ ] For the aformetioned new categories, add _more accurate data_ by integrating RAG into the LLM prompt.
- [ ] Provide custom landmark questions using an LLM with RAG.
- [ ] Implement a _guess place_ win condition.
- [ ] Use a local YOLO model in the browser to add _curses_, which require a player to photograph a certain object.
- [ ] User authentication to scope games to a person.

## Technology stack

- [SvelteKit](https://svelte.dev/) - full-stack web application framework.
- [Bun](https://bun.sh/) - JavaScript package manager, bundler and runtime.
- [Leaflet](https://leafletjs.com/) - JavaScript mapping library
- OpenAI JavaScript library

### Slop status

This repository has been started and initially built **without** the use of AI agents.
Later in the project, we **have started to use AI agents**. To ensure consistency and
quality, we have written a detailed **Copilot instruction file** in .github/copilot-instructions.md,
which is sourced by the agent. The extensive use of linters and type checking also helps
ensure consistent quality and avoid many trivial bugs.

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
