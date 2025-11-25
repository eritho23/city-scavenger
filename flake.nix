{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    systems.url = "github:nix-systems/default";
    bun2nix = {
      inputs.nixpkgs.follows = "nixpkgs";
      url = "github:nix-community/bun2nix";
    };
    treefmt-nix = {
      inputs.nixpkgs.follows = "nixpkgs";
      url = "github:numtide/treefmt-nix";
    };
  };

  outputs =
    {
      self,
      bun2nix,
      nixpkgs,
      systems,
      treefmt-nix,
      ...
    }:
    let
      eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
      treefmtEval = eachSystem (pkgs: treefmt-nix.lib.evalModule pkgs ./nix/treefmt.nix);
    in
    {
      apps = eachSystem (pkgs: {
        makefile-format = with pkgs; {
          type = "app";
          program =
            (writeShellScript "makefile-format" ''
              ${lib.getBin findutils}/bin/find . -name '*.mk' -or -name 'Makefile' | xargs ${lib.getBin mbake}/bin/mbake format
            '').outPath;
        };
      });
      checks = eachSystem (
        pkgs: with pkgs; {
          formatting = treefmtEval.${stdenv.hostPlatform.system}.config.build.check self;
          svelte = self.outputs.packages.${stdenv.hostPlatform.system}.frontend;
        }
      );
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            (pkgs.callPackage ./nix/go-migrate.nix { })
            bun
            bun2nix.packages.${stdenv.hostPlatform.system}.default
            curl
            getent
            git
            groff
            helix
            jq
            less
            man
            ncurses
            neovim-unwrapped
            nodejs
            npm-check-updates
            openssh
            pdpmake
            postgresql.out
            prefetch-npm-deps
            procps
            python3
            sops
            svelte-language-server
            tmux
            tokei
            typescript-language-server
            uutils-coreutils-noprefix
            vscode-langservers-extracted
          ];
          shellHook = ''
            # Hack to make treefmt faster.
            # ${treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper}
            export TERM="linux"
            export HOME=$(getent passwd $(id -u) | cut -d: -f6)
            export PS1='[\[\e[38;5;92m\]scavenger-dev\[\e[0m\]:\[\e[38;5;202m\]\w\[\e[0m\]]\\$ '
            export SOPS_EDITOR=nvim

            export PGHOST=$(pwd)/tmp
            export PGDATABASE=cityscav
            export PGUSERNAME=cityscav
            export DATABASE_URL=postgresql://cityscav@/cityscav?host=$(readlink ./tmp)

            # Source all secret environment variables.
            if ! source <(sops -d --output-type dotenv secrets/secrets.env 2>/dev/null | awk '{print "export " $0}') 2>/dev/null; then
              echo ""
              echo "Note: Secrets could not be loaded."
              echo "You need to generate a SOPS key and get access to the secrets."
              echo "See the README for setup instructions."
              echo ""
            fi
          '';
        };
      });
      formatter = eachSystem (pkgs: treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper);
      packages = eachSystem (
        pkgs: with pkgs; rec {
          frontend = bun2nix.mkDerivation {
            pname = "city-scavenger-frontend";
            version = if (self ? rev) then self.rev else "dirty";
            src = lib.cleanSource ./.;
            bunDeps = bun2nix.fetchBunDeps {
              bunNix = ./bun.nix;
            };

            buildPhase = ''
              bun --bun run build
            '';

            installPhase = ''
              mkdir -p "$out"
              cp -r ./build/* "$out"

              # bun install --production
              # cp -r node_modules "$out"
            '';
          };
          default = frontend;
        }
      );
    };
}
