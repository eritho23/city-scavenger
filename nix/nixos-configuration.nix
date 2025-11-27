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
      # Do not use GTK.
      "-nographic"
    ];
  };
  # Use serial instead.
  boot.kernelParams = [
    "console=ttyS0,115200n8"
  ];
  users.users.root.password = "toor";
  services.city-scav = {
    enable = true;
    postgres.configureLocal = true;
  };
  system.stateVersion = "25.05";
}
