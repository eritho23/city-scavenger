{ self }:
{
  config,
  pkgs,
  lib,
  ...
}:
with lib;
let
  cfg = config.services.city-scav;
  goMigrate = pkgs.callPackage ./go-migrate.nix { };
  cityScavBundle = self.packages.${pkgs.stdenv.hostPlatform.system}.frontend;
  postgresConnectionStringFile =
    if !cfg.postgres.configureLocal then
      cfg.postgres.connectionStringFile
    else
      pkgs.writeText "database-url" "postgresql://city-scav@/city-scav?host=/run/postgresql";
in
{
  options.services.city-scav = {
    enable = mkEnableOption "Whether to enable the CityScav service.";
    publicUrl = mkOption {
      description = "The full public URL of the instance, including protocol and port, used for the ORIGIN environment variable.";
      type = types.str;
      default = "http://localhost:8080";
    };
    postgres = {
      connectionStringFile = mkOption {
        default = "";
        type = types.str;
      };
      configureLocal = mkEnableOption "Whether or not to configure Postgres locally on the node.";
    };
    nginxConfiguration = {
      enable = mkEnableOption "Whether or not to configure NGINX for the server.";
      acmeProvisioning = {
        enable = mkEnableOption "Whether or not to provision an ACME certificate.";
        domain = mkOption {
          default = "";
          description = "The domain name that will be used for ACME Let's Encrypt provisioning.";
          type = types.str;
        };
      };
    };
  };

  config = mkIf cfg.enable {
    services.postgresql = mkIf cfg.postgres.configureLocal {
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

    services.nginx.virtualHosts."city-scav" = mkIf cfg.nginxConfiguration.enable {
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
      after =
        if !cfg.postgres.configureLocal then
          [
            "postgresql.service"
            "postgresql-setup.service"
          ]
        else
          [ "network.target" ];
      requires = optionals cfg.postgres.configureLocal [
        "postgresql.service"
        "postgresql-setup.service"
      ];
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        # Execute the main process only after migrations are applied.
        ExecStartPre = pkgs.writeShellScript "city-scav-exec-start-pre" ''
          export DATABASE_URL="$(cat ${postgresConnectionStringFile})"

          ${optionalString cfg.postgres.configureLocal ''
            while [ ! -S /run/postgresql/.s.PGSQL.5432 ]; do sleep 0.5; done
          ''}

          ${getExe goMigrate} -path ${cleanSource ../migrations} -database $DATABASE_URL up
        '';

        ExecStart = pkgs.writeShellScript "city-scav-exec-start" ''
          export SOCKET_PATH=$RUNTIME_DIRECTORY/http.sock
          export DATABASE_URL="$(cat ${postgresConnectionStringFile})"
          ${getBin pkgs.bun}/bin/bun --bun run ${cityScavBundle}/index.js
        '';

        Type = "simple";

        Environment = [
          "ORIGIN=${cfg.publicUrl}"
        ];

        # Execution and restart policies.
        DynamicUser = false;
        RestartSec = "10s";
        RuntimeDirectory = "city-scav";
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
    };
  };
}
