import { createPublicKey, verify } from 'node:crypto';
import { createSessionCookie, parseJsonBody } from './_admin-auth.js';
import { bootstrapAdminFromEnv, createOrUpdateGoogleUser } from './_users-db.js';

const jwksUrl = 'https://www.googleapis.com/oauth2/v3/certs';
let cachedKeys = null;
let cachedUntil = 0;

function base64UrlDecode(value) {
  return Buffer.from(String(value).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function parseJwt(token) {
  const [header, payload, signature] = String(token || '').split('.');
  if (!header || !payload || !signature) throw new Error('Invalid Google credential.');
  return {
    header: JSON.parse(base64UrlDecode(header).toString('utf8')),
    payload: JSON.parse(base64UrlDecode(payload).toString('utf8')),
    signed: `${header}.${payload}`,
    signature: base64UrlDecode(signature),
  };
}

async function getGoogleKeys() {
  if (cachedKeys && Date.now() < cachedUntil) return cachedKeys;

  const response = await fetch(jwksUrl);
  if (!response.ok) throw new Error('Unable to verify Google sign-in.');
  const data = await response.json();
  cachedKeys = data.keys || [];
  cachedUntil = Date.now() + 60 * 60 * 1000;
  return cachedKeys;
}

async function verifyGoogleCredential(credential) {
  const token = parseJwt(credential);
  if (token.header.alg !== 'RS256') throw new Error('Unsupported Google credential.');

  const keys = await getGoogleKeys();
  const key = keys.find((item) => item.kid === token.header.kid);
  if (!key) throw new Error('Unable to verify Google sign-in.');

  const publicKey = createPublicKey({ key, format: 'jwk' });
  const valid = verify('RSA-SHA256', Buffer.from(token.signed), publicKey, token.signature);
  if (!valid) throw new Error('Invalid Google credential.');

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Google sign-in is not configured.');
  if (token.payload.aud !== clientId) throw new Error('Google sign-in client mismatch.');
  if (!['https://accounts.google.com', 'accounts.google.com'].includes(token.payload.iss)) {
    throw new Error('Invalid Google issuer.');
  }
  if (Number(token.payload.exp || 0) * 1000 < Date.now()) throw new Error('Google credential has expired.');
  if (!token.payload.email_verified) throw new Error('Google account email is not verified.');

  return token.payload;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await bootstrapAdminFromEnv();
    const { credential } = await parseJsonBody(req);
    const profile = await verifyGoogleCredential(credential);
    const user = await createOrUpdateGoogleUser({
      email: profile.email,
      fullName: profile.name || profile.email,
      googleSub: profile.sub,
    });

    res.setHeader('Set-Cookie', createSessionCookie(user, req));
    return res.status(200).json({
      authenticated: true,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      id: user.id,
    });
  } catch (error) {
    return res.status(401).json({ error: error.message || 'Google sign-in failed.' });
  }
}
