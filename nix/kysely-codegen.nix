{
  fetchFromGitHub,
  lib,
  nodejs,
  pnpm,
  stdenvNoCC,
  writeShellScriptBin
}:
let
bundle = stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "kysely-codegen";
  version = "0.19.0";

  src = fetchFromGitHub {
    owner = "RobinBlomberg";
    repo = "kysely-codegen";
    rev = "0.19.0";
    hash = "sha256-SuD1mdgm+OuXpuFVFFmHMjeHS3SLmIyPCZUL5+4gAFA=";
  };

  nativeBuildInputs = [
    nodejs
    pnpm.configHook
  ];

  pnpmDeps = pnpm.fetchDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 2;
    hash = "sha256-BSDflsTWMgGdqvI2ryVuUWqxVuzr6egXKTwGWVamVzg=";
  };

  buildPhase = ''
    pnpm run build
    mkdir -p "$out"
    cp --recursive dist "$out"
    cp --recursive --dereference node_modules "$out"
  '';
});
in
writeShellScriptBin "kysely-codegen" ''
  exec ${lib.getBin nodejs}/bin/node ${bundle}/dist/cli/bin.js "$@"
''
