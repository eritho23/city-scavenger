{ pkgs, lib, ... }:
{
  projectRootFile = "flake.nix";

  programs = {
    biome = {
      includes = [
        "*.svelte"
        "*.geojson"
      ];
      enable = true;
      settings = {
        formatter = {
          lineWidth = 120;
        };
        html.formatter.indentScriptAndStyle = true;
        # From https://biomejs.dev/internals/language-support/#linting-html-ish-languages.
        overrides = [
          {
            includes = [ "**/*.svelte" ];
            linter.rules = {
              style = {
                useConst = "off";
              };
            };
          }
        ];
      };
    };
    black.enable = true;
    deadnix.enable = true;
    dos2unix.enable = true;
    mdformat.enable = true;
    nixfmt.enable = true;
    shfmt.enable = true;
    statix.enable = true;
    yamlfmt.enable = true;
    sql-formatter = {
      enable = true;
      dialect = "postgresql";
    };
  };

  settings.formatter = {
    "mbake" = {
      command = "${lib.getBin pkgs.bash}/bin/bash";
      options = [
        "-euc"
        ''
          for file in "$@"; do
            ${lib.getBin pkgs.mbake}/bin/mbake format $file
          done
        ''
        "--"
      ];
      includes = [
        "*.mk"
        "Makefile"
      ];
    };
  };
}
