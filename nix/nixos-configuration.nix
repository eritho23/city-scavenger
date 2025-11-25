{ modulesPath, ... }:
{
  config = {
    imports = [
      "${modulesPath}/virtualisation/qemu-vm.nix"
    ];
    virtualisation.vmVariant = {
      memorySize = 2048;
      cores = 2;
      qemu.options = [
        "-accel kvm"
      ];
    };
    services.city-scav = {
      enable = true;
      postgres.configureLocal = true;
    };
    system.stateVersion = "25.05";
  };
}
