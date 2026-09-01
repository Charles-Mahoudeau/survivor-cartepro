{
  description = "CartePro — environnement de développement (Bun · NestJS · PostgreSQL · jj)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "aarch64-darwin"
        "x86_64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (
        pkgs:
        let
          toolchain = [
            pkgs.bun
            pkgs.nodejs_24
          ];

          services = [ pkgs.postgresql_18 ];

          # Le shell ne fait que signaler ce qui manque.
          hint = ''
            echo "CartePro — devShell nix"
            if [ ! -f .env ] && [ -f .env.example ]; then
              echo "  · .env absent : cp .env.example .env"
            fi
            if [ ! -d node_modules ]; then
              echo "  · dépendances absentes : bun install"
            fi
            echo "  · bun run dev · bun run db:up · bun run db:status"
          '';
        in
        {
          # `nix develop` : tout ce qu'il faut pour développer le projet sans
          # rien avoir installé au préalable.
          default = pkgs.mkShellNoCC {
            name = "cartepro";
            packages = toolchain ++ services;
            shellHook = hint;
          };
        }
      );

      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);
    };
}
