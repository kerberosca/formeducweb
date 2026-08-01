import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export type DemoOnatchiwayCredentials = {
  hash: string;
  salt: string;
};

export async function deriveDemoOnatchiwayPasswordHash(
  password: string,
  salt: string
) {
  const derived = (await scrypt(
    password,
    Buffer.from(salt, "base64url"),
    64
  )) as Buffer;

  return derived.toString("base64url");
}

export async function verifyDemoOnatchiwayPassword(
  password: string,
  credentials: DemoOnatchiwayCredentials = {
    hash: process.env.DEMO_ONATCHIWAY_PASSWORD_HASH ?? "",
    salt: process.env.DEMO_ONATCHIWAY_PASSWORD_SALT ?? ""
  }
) {
  if (!password || !credentials.hash || !credentials.salt) return false;

  const receivedHash = await deriveDemoOnatchiwayPasswordHash(
    password,
    credentials.salt
  );
  const received = Buffer.from(receivedHash, "utf8");
  const expected = Buffer.from(credentials.hash, "utf8");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
