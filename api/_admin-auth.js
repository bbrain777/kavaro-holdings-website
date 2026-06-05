import { createHmac, timingSafeEqual } from 'node:crypto';

const cookieName = 'kavaro_admin_session';
const sessionMaxAge = 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.STRIPE_SECRET_KEY || 'development-session-secret';
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(payload) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isLocalRequest(req) {
  return String(req.headers.host || '').includes('localhost') || String(req.headers.host || '').includes('127.0.0.1');
}

export function createSessionCookie(user, req) {
  const payload = base64Url(JSON.stringify({
    id: user.id || '',
    email: user.email,
    fullName: user.fullName || user.full_name || '',
    role: user.role || 'user',
    exp: Date.now() + sessionMaxAge * 1000,
  }));
  const token = `${payload}.${sign(payload)}`;
  const secure = isLocalRequest(req) ? '' : '; Secure';
  return `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionMaxAge}${secure}`;
}

export function clearSessionCookie() {
  return `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getAdminSession(req) {
  const cookies = Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map((item) => item.trim().split('='))
      .filter(([key, value]) => key && value)
  );
  const token = cookies[cookieName];
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.email || !session.exp || Date.now() > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

export function hasRole(session, allowedRoles) {
  return Boolean(session && allowedRoles.includes(session.role));
}

export async function parseJsonBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}
