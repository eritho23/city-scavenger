_: {
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
  };
}
