import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const DEFAULT_ENDPOINT = "http://formeducweb:3000/api/internal/email-jobs";
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const MIN_INTERVAL_MS = 60 * 1000;
const MAX_INTERVAL_MS = 60 * 60 * 1000;
const MAX_RESPONSE_BYTES = 1024 * 1024;

function getConfiguration() {
  const secret = (
    process.env.EMAIL_JOB_SECRET ||
    process.env.CRON_SECRET ||
    ""
  ).trim();
  const endpoint = (process.env.EMAIL_JOB_ENDPOINT || DEFAULT_ENDPOINT).trim();
  const configuredInterval = Number(
    process.env.EMAIL_JOB_INTERVAL_MS || DEFAULT_INTERVAL_MS
  );

  if (!secret) {
    throw new Error("EMAIL_JOB_SECRET est requis pour le processeur.");
  }
  if (!/^https?:\/\//i.test(endpoint)) {
    throw new Error("EMAIL_JOB_ENDPOINT doit être une URL HTTP(S).");
  }
  if (
    !Number.isFinite(configuredInterval) ||
    configuredInterval < MIN_INTERVAL_MS ||
    configuredInterval > MAX_INTERVAL_MS
  ) {
    throw new Error(
      `EMAIL_JOB_INTERVAL_MS doit être compris entre ${MIN_INTERVAL_MS} et ${MAX_INTERVAL_MS}.`
    );
  }

  return {
    endpoint,
    intervalMs: Math.round(configuredInterval),
    secret
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function postJson(endpoint, secret) {
  const url = new URL(endpoint);
  const request = url.protocol === "https:" ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    const outgoingRequest = request(
      url,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${secret}`,
          "Content-Length": "0",
          "X-Forwarded-Proto": "https"
        },
        signal: AbortSignal.timeout(30_000)
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
          if (Buffer.byteLength(body, "utf8") > MAX_RESPONSE_BYTES) {
            response.destroy(
              new Error("La réponse du processeur de courriels est trop grande.")
            );
          }
        });
        response.on("error", reject);
        response.on("end", () => {
          let payload = null;
          try {
            payload = body ? JSON.parse(body) : null;
          } catch {
            payload = null;
          }

          const status = response.statusCode || 0;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            payload
          });
        });
      }
    );

    outgoingRequest.on("error", reject);
    outgoingRequest.end();
  });
}

async function processOnce(configuration) {
  const response = await postJson(
    configuration.endpoint,
    configuration.secret
  );
  const payload = response.payload;

  if (!response.ok) {
    throw new Error(
      `Le processeur a répondu ${response.status}: ${
        payload?.error || "réponse invalide"
      }`
    );
  }

  const summary = {
    considered: Number(payload?.considered || 0),
    sent: Number(payload?.sent || 0),
    cancelled: Number(payload?.cancelled || 0),
    failed: Number(payload?.failed || 0)
  };

  if (summary.failed > 0) {
    console.error("Email jobs completed with failures", summary);
  } else if (summary.considered > 0) {
    console.log("Email jobs completed", summary);
  }
}

const configuration = getConfiguration();

for (;;) {
  try {
    await processOnce(configuration);
  } catch (error) {
    console.error(
      "Email jobs worker error",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }

  await wait(configuration.intervalMs);
}
