_: {
  projectRootFile = "flake.nix";

  programs = {
    biome.enable = true;
    black.enable = true;
    deadnix.enable = true;
    dos2unix.enable = true;
    nixfmt.enable = true;
    statix.enable = true;
  };
}
