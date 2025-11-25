{
  config,
  pkgs,
  lib,
  city-scav-bundle,
  ...
}:
let
  cfg = config.services.city-scav;
  goMigrate = pkgs.callPackage ./go-migrate.nix { };
in
{
  options.services.city-scav = with lib; {
    enable = mkEnableOption "Whether to enable the CityScav service.";
    publicUrl = mkOption {
      description = "The full public URL of the instance, including protocol and port, used for the ORIGIN environment variable.";
      type = types.str;
    };
    postgres = {
      connectionStringFile = mkOption {
        type = types.str;
      };
      configureLocal = mkEnableOption "Whether or not to configure Postgres locally on the node.";
    };
    nginxConfiguration = {
      enable = mkEnableOption "Whether or not to configure NGINX for the server.";
      acmeProvisioning = {
        enable = mkEnableOption "Whether or not to provision an ACME certificate.";
        domain = mkOption {
          description = "The domain name that will be used for ACME Let's Encrypt provisioning.";
          type = types.bool;
        };
      };
    };
  };

  config =
    let
      postgresConnectionStringFile =
        if !cfg.postgres.configureLocal then
          cfg.postgres.connectionStringFile
        else
          pkgs.writeText "database-url" "postgresql://city-scav@/city-scav?host=/run/postgresql";
    in
    lib.mkIf cfg.enable {
      services.postgresql = lib.mkIf cfg.postgres.configureLocal {
        enable = true;
        ensureDatabases = [ "city-scav" ];
        ensureUsers = [
          {
            name = "city-scav";
            ensureDBOwnership = true;
            ensureClauses.login = true;
          }
        ];
      };

      services.nginx.virtualHosts."city-scav" = lib.mkIf cfg.nginxConfiguration.enable {
        locations."/" = {
          proxyPass = "http://unix:/run/city-scav/http.sock";
        };
      };

      users.users."city-scav" = {
        isSystemUser = true;
        createHome = false;
        group = "city-scav";
      };
      users.groups."city-scav" = { };

      systemd.services."city-scav" = {
        description = "The CityScavenger Bun HTTP server.";
        serviceConfig = {
          # Execute the main process only after migrations are applied.
          ExecStartPre = lib.writeShellScript "city-scav-exec-start-pre" ''
            export DATABASE_URL="$(cat ${postgresConnectionStringFile})"
            ${goMigrate} -path ${lib.cleanSource ../migrations} -database $DATABASE_URL up
          '';

          ExecStart = lib.writeShellScript "city-scav-exec-start" ''
            export DATABASE_URL="$(cat ${postgresConnectionStringFile})"
            ${lib.getBin pkgs.bun}/bin/bun --bun run ${city-scav-bundle}/index.js
          '';

          Type = "simple";

          Environment = [
            "ORIGIN=${cfg.publicUrl}"
            "SOCKET_PATH=%t/http.sock"
          ];

          # Execution and restart policies.
          DynamicUser = true;
          RestartSec = "10s";
          RuntimeDirectory = "city-scav";
          StartLimitIntervalSec = 30;
          StateDirectory = "city-scav";
          WorkingDirectory = "%S";

          User = "city-scav";
          Group = "city-scav";

          # Hardening options.
          LockPersonality = true;
          # Bun does not work without W^X memory.
          MemoryDenyWriteExecute = false;
          NoNewPrivileges = true;
          PrivateDevices = true;
          PrivateTmp = true;
          PrivateUsers = true;
          ProtectClock = true;
          ProtectControlGroups = true;
          ProtectHome = true;
          ProtectHostname = true;
          ProtectKernelLogs = true;
          ProtectKernelModules = true;
          ProtectKernelTunables = true;
          ProtectSystem = "strict";
          RestrictAddressFamilies = [
            "AF_UNIX"
            "AF_INET"
            "AF_INET6"
          ];
          RestrictNamespaces = true;
          RestrictRealtime = true;
          RestrictSUIDSGID = true;
          SystemCallFilter = [
            "@system-service"
            "~@privileged"
          ];
          UMask = "0007";
        };
        unitConfig = {
          After = if !cfg.postgres.configureLocal then [ "postgresql.service" ] else [ "network.target" ];
          Requires = lib.optionals cfg.postgres.configureLocal [ "postgresql.service" ];
          WantedBy = [ "multi-user.target" ];
        };
      };
    };
}
