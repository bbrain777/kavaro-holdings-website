import { createSessionCookie, parseJsonBody } from './_admin-auth.js';
import { createOrUpdateUser, getUserByEmail } from './_users-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    if (!body.email || !body.fullName || !body.password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (String(body.password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existingUser = await getUserByEmail(body.email);
    if (existingUser) return res.status(409).json({ error: 'An account already exists for this email.' });

    const user = await createOrUpdateUser({
      email: body.email,
      fullName: body.fullName,
      phone: body.phone || '',
      role: 'user',
      password: body.password,
    });

    res.setHeader('Set-Cookie', createSessionCookie(user, req));
    return res.status(200).json({ authenticated: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to create account.' });
  }
}
