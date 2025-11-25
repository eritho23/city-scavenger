{ pkgs, lib, ... }:
{
  projectRootFile = "flake.nix";

  programs = {
    biome = {
      enable = true;
      settings = {
        formatter = {
          lineWidth = 120;
        };
      };
    };
    black.enable = true;
    deadnix.enable = true;
    dos2unix.enable = true;
    mdformat.enable = true;
    nixfmt.enable = true;
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
