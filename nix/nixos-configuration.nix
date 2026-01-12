{modulesPath, ...}: {
  imports = [
    "${modulesPath}/profiles/minimal.nix"
    "${modulesPath}/profiles/perlless.nix"
    "${modulesPath}/virtualisation/qemu-vm.nix"
  ];

  virtualisation = {
    memorySize = 2048;
    msize = 32768;
    cores = 4;
    graphics = false;
  };

  # Use serial instead.
  boot.kernelParams = [
    "console=ttyS0,115200n8"
  ];
  users = {
    users.root.password = "toor";
    mutableUsers = false;
  };
  services.city-scav = {
    enable = true;
    postgres.configureLocal = true;
  };
  system.stateVersion = "25.05";
}
