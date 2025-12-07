import crypto from "crypto";

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function sign(payload: Record<string, any>, secret: string, expiresInSec = 60 * 15) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const headerB64 = base64url(JSON.stringify(header));
  const bodyB64 = base64url(JSON.stringify(body));
  const data = `${headerB64}.${bodyB64}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64");
  const sigB64 = signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${data}.${sigB64}`;
}

export function verify(token: string, secret: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token format");
    const [headerB64, bodyB64, sig] = parts;
    const data = `${headerB64}.${bodyB64}`;
    const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64");
    const expected = expectedSig.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    if (sig !== expected) throw new Error("Invalid signature");
    const bodyJson = Buffer.from(bodyB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(bodyJson);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) throw new Error("Token expired");
    return payload;
  } catch (err) {
    throw err;
  }
}
