import crypto from "node:crypto";

const SESSION_COOKIE = "fathom_sid";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function parseCookies(header: string | null) {
  if (!header) return new Map<string, string>();
  const entries = header.split(";").map((part) => part.trim());
  const map = new Map<string, string>();
  for (const entry of entries) {
    if (!entry) continue;
    const index = entry.indexOf("=");
    if (index === -1) continue;
    const key = entry.slice(0, index).trim();
    const value = entry.slice(index + 1).trim();
    if (!key) continue;
    map.set(key, value);
  }
  return map;
}

export function getSessionId(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const value = cookies.get(SESSION_COOKIE);
  return value && value.length > 0 ? value : null;
}

export function ensureSessionId(request: Request) {
  const existing = getSessionId(request);
  if (existing) {
    return { id: existing, isNew: false };
  }
  return { id: crypto.randomUUID(), isNew: true };
}

export function applySessionCookie(
  response: Response,
  session: { id: string; isNew: boolean },
) {
  if (!session.isNew) {
    return response;
  }
  const secure = process.env.NODE_ENV === "production";
  const cookie = [
    `${SESSION_COOKIE}=${session.id}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
  response.headers.append("Set-Cookie", cookie);
  return response;
}
