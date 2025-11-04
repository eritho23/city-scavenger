{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: 
  let
    pkgsx86_64 = import nixpkgs {system = "x86_64-linux";};
    in
  {
    devShells.x86_64-linux.default = pkgsx86_64.mkShell {
      packages = with pkgsx86_64; [
        nodejs
      ];
    };
  };
}
