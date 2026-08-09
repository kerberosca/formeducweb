import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(path.resolve(relativePath), "utf8");
}

describe("production low-ticket packaging", () => {
  it("emballe les gabarits et le travailleur de courriels dans l'image", () => {
    const dockerfile = read("Dockerfile");
    const dockerignore = read(".dockerignore");

    expect(dockerfile).toContain("COPY --from=builder /app/assets ./assets");
    expect(dockerfile).toContain(
      "COPY --from=builder /app/scripts/ops ./scripts/ops"
    );
    expect(dockerfile).not.toContain(
      "prisma migrate deploy && exec npx next start"
    );
    expect(dockerignore).toContain(".env.*");
    expect(dockerignore).toContain("!.env.production.example");
  });

  it("configure un travailleur isolé et une migration explicite", () => {
    const compose = read("docker-compose.yml");
    const productionEnvironment = read(".env.production.example");
    const migrationLauncher = read("scripts/ops/migrate-production.mjs");

    expect(compose).toContain("email_jobs_worker:");
    expect(compose).toContain(
      "EMAIL_JOB_ENDPOINT: http://formeducweb:3000/api/internal/email-jobs"
    );
    expect(compose).toContain('profiles: ["ops"]');
    expect(compose).toContain(
      'command: ["node", "scripts/ops/migrate-production.mjs"]'
    );
    expect(productionEnvironment).toContain("EMAIL_UNSUBSCRIBE_SECRET=");
    expect(productionEnvironment).toContain("EMAIL_JOB_SECRET=");
    expect(migrationLauncher).toContain("deactivate_seeded_admin");
  });

  it("publie le port de production uniquement sur l'interface locale", () => {
    const compose = read("docker-compose.yml");
    const publishedAppPorts = Array.from(
      compose.matchAll(/^\s*-\s*"([^"]+:3000)"\s*$/gm),
      ([, binding]) => binding
    );

    expect(publishedAppPorts).toEqual(["127.0.0.1:3010:3000"]);
    expect(publishedAppPorts).not.toContain("3010:3000");
  });

  it("exige l'attestation GestionVPS avant une maintenance destructive", () => {
    const guard = read("scripts/ops/require-recent-backup.sh");
    const deploymentGuide = read("docs/DEPLOY-VPS.md");
    const updateProcedure = deploymentGuide.slice(
      deploymentGuide.indexOf("## Mise à jour")
    );

    expect(guard).toContain(
      'PRODUCTION_HELPER="/usr/local/sbin/gestion-vps-backup-guard"'
    );
    expect(guard).toContain('--application "$APPLICATION"');
    expect(guard).toContain("--require-remote-verified");
    expect(guard).toContain("--require-signed-marker");

    const syncIndex = updateProcedure.indexOf("git pull --ff-only");
    const guardIndex = updateProcedure.indexOf("require-recent-backup.sh");
    const buildIndex = updateProcedure.indexOf("build formeducweb");
    const migrationIndex = updateProcedure.indexOf("formeducweb_migrate");

    expect(syncIndex).toBeGreaterThanOrEqual(0);
    expect(guardIndex).toBeGreaterThan(syncIndex);
    expect(buildIndex).toBeGreaterThan(guardIndex);
    expect(migrationIndex).toBeGreaterThan(guardIndex);
  });
});
