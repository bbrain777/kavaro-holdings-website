import { createSessionCookie, parseJsonBody } from './_admin-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Admin access is not configured yet.' });
  }

  try {
    const { email, password } = await parseJsonBody(req);
    const isAdmin = String(email || '').trim().toLowerCase() === adminEmail.toLowerCase() && String(password || '') === adminPassword;

    if (!isAdmin) {
      return res.status(401).json({ error: 'Admin access denied.' });
    }

    res.setHeader('Set-Cookie', createSessionCookie(adminEmail, req));
    return res.status(200).json({ authenticated: true, email: adminEmail });
  } catch {
    return res.status(400).json({ error: 'Invalid login request.' });
  }
}
