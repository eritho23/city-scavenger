_: {
  projectRootFile = "flake.nix";

  programs = {
    alejandra.enable = true;
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
            includes = ["**/*.svelte"];
            linter.rules = {
              correctness = {
                noUnusedImports = "off";
                noUnusedVariables = "off";
              };
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
    mbake.enable = true;
    mdformat.enable = true;
    shfmt.enable = true;
    statix.enable = true;
    yamlfmt.enable = true;
    sql-formatter = {
      enable = true;
      dialect = "postgresql";
    };
  };
}
