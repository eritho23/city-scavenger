{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    systems.url = "github:nix-systems/default";
    treefmt-nix = {
      inputs.nixpkgs.follows = "nixpkgs";
      url = "github:numtide/treefmt-nix";
    };
  };

  outputs =
    {
      self,
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
      checks = eachSystem (pkgs: {
        formatting = treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.check self;
      });
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            curl
            getent
            git
            groff
            helix
            jq
            less
            man
            ncurses
            nodejs
            npm-check-updates
            pdpmake
            prefetch-npm-deps
            python3
            uutils-coreutils-noprefix
          ];
          # Hack to make treefmt faster.
          shellHook = ''
            # ${treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper}
            export TERM="linux"
            export HOME=$(getent passwd $(id -u) | cut -d: -f6)
            export PS1='[\[\e[38;5;92m\]scavenger-dev\[\e[0m\]:\[\e[38;5;202m\]\w\[\e[0m\]]\\$ '
          '';
        };
      });
      formatter = eachSystem (pkgs: treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper);
      packages = eachSystem (
        pkgs: with pkgs; rec {
          frontend = buildNpmPackage {
            pname = "city-scavenger-frontend";
            version = if (self ? rev) then self.rev else "dirty";

            src = lib.cleanSource ./.;

            npmDepsHash = "sha256-Nzm3zOOlT6RSrAq+cIr0gejdLkn7c1KZP6N0+CQz0kk=";

            buildPhase = ''
              NODE_ENV=production npm run build --offline  
            '';

            installPhase = ''
              mkdir -p "$out"  
              cp -r ./build/* "$out"
              cp -r ./node_modules "$out"
            '';
          };
          default = frontend;
        }
      );
    };
}
