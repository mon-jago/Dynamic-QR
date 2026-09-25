import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const QR_TOKEN_TTL_MS = 30_000;

type QrTokenPayload = {
  destination: string;
  expiresAt: number;
  jti: string;
};

const consumedTokens = new Map<string, number>();

const getSecret = () =>
  process.env.QR_TOKEN_SECRET ?? "porsenigama26-development-qr-secret";

const encode = (value: string) => Buffer.from(value).toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string) =>
  createHmac("sha256", getSecret()).update(payload).digest("base64url");

export const isValidDestination = (destination: string) => {
  try {
    const url = new URL(destination);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const createQrToken = (destination: string) => {
  const payload = JSON.stringify({
    destination,
    expiresAt: Date.now() + QR_TOKEN_TTL_MS,
    jti: randomUUID(),
  });
  const encodedPayload = encode(payload);
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifyQrToken = (token: string) => {
  const [encodedPayload, encodedSignature] = token.split(".");

  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const receivedSignature = Buffer.from(encodedSignature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    receivedSignature.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(receivedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload)) as {
      destination?: unknown;
      expiresAt?: unknown;
      jti?: unknown;
    };

    if (
      typeof payload.destination !== "string" ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.jti !== "string" ||
      payload.expiresAt <= Date.now() ||
      !isValidDestination(payload.destination)
    ) {
      return null;
    }

    for (const [consumedToken, expiresAt] of consumedTokens) {
      if (expiresAt <= Date.now()) {
        consumedTokens.delete(consumedToken);
      }
    }

    if (consumedTokens.has(payload.jti)) {
      return null;
    }

    consumedTokens.set(payload.jti, payload.expiresAt);
    return payload as QrTokenPayload;
  } catch {
    return null;
  }
};
