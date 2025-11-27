{
  modulesPath,
  ...
}:
{
  imports = [
    "${modulesPath}/virtualisation/qemu-vm.nix"
    "${modulesPath}/profiles/minimal.nix"
  ];
  virtualisation.vmVariant = {
    memorySize = 2048;
    cores = 2;
    qemu.options = [
      "-accel kvm"
    ];
  };
  users.users.root.password = "toor";
  services.city-scav = {
    enable = true;
    postgres.configureLocal = true;
  };
  system.stateVersion = "25.05";
}
