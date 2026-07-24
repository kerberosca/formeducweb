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
});
