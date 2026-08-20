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
    const nextConfig = read("next.config.mjs");

    expect(dockerfile).toContain("COPY --from=builder /app/assets ./assets");
    expect(dockerfile).toContain(
      "COPY --from=builder /app/scripts/ops ./scripts/ops"
    );
    expect(dockerfile).toContain(
      "COPY --from=builder /app/lib/training.ts ./lib/training.ts"
    );
    expect(dockerfile).toContain(
      "COPY --from=builder --chown=nextjs:nodejs /app/data/lms-resources ./lms-seed-resources"
    );
    expect(dockerfile).toContain(
      "COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next"
    );
    expect(dockerfile).not.toContain(
      "prisma migrate deploy && exec npx next start"
    );
    expect(dockerignore).toContain(".env.*");
    expect(dockerignore).toContain("!.env.production.example");
    expect(nextConfig).toContain("serverActions");
    expect(nextConfig).toContain('bodySizeLimit: "26mb"');
  });

  it("fournit une surcouche Docker locale isolée des services externes", () => {
    const localCompose = read("docker-compose.local.yml");
    const productionCompose = read("docker-compose.yml");

    expect(localCompose).toContain("name: formeducweb-local");
    expect(localCompose).toContain("ports: !override");
    expect(localCompose).toContain('"127.0.0.1:3010:3000"');
    expect(localCompose).not.toContain('- "3010:3000"');
    expect(localCompose).toContain("env_file: !override []");
    expect(localCompose).toContain('DISABLE_EXTERNAL_SERVICES: "1"');
    expect(localCompose).toContain('STRIPE_SECRET_KEY: ""');
    expect(localCompose).toContain('STRIPE_WEBHOOK_SECRET: ""');
    expect(localCompose).toContain('RESEND_API_KEY: ""');
    expect(localCompose).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID: ""');
    expect(localCompose).toContain("AUTH_SMTP_HOST: mailpit");
    expect(localCompose).toContain('AUTH_SMTP_ALLOW_LOCAL: "1"');
    expect(localCompose).toContain("image: axllent/mailpit:");
    expect(localCompose).toContain('"127.0.0.1:8025:8025"');
    expect(localCompose).not.toContain('"1025:1025"');
    expect(localCompose).toContain("profiles: !reset []");
    expect(localCompose).toContain(
      "EMAIL_JOB_SECRET: local-only-email-job-secret"
    );
    expect(localCompose).toContain(
      "container_name: formeducweb_email_jobs_local"
    );
    expect(localCompose).toContain('EMAIL_JOB_INTERVAL_MS: "60000"');
    expect(productionCompose).not.toContain("DISABLE_EXTERNAL_SERVICES");
    expect(productionCompose).not.toContain("docker-compose.local.yml");
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
    expect(migrationLauncher).toContain('"migrate", "deploy"');
    expect(migrationLauncher).not.toContain("admin_users");
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

  it("conserve l'historique Demo839 puis supprime ses tables en dernier", () => {
    const historicalMigration = read(
      "prisma/migrations/20260722000000_add_demo839/migration.sql"
    );
    const dropMigration = read(
      "prisma/migrations/20260820010000_drop_demo839/migration.sql"
    );

    expect(historicalMigration).toContain("CREATE TABLE `admin_users`");
    expect(dropMigration).toContain("DROP TABLE IF EXISTS `admin_sessions`");
    expect(dropMigration).toContain("DROP TABLE IF EXISTS `admin_users`");
  });
});
