import { createSessionCookie, parseJsonBody } from './_admin-auth.js';
import { authenticateUser, bootstrapAdminFromEnv } from './_users-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = await parseJsonBody(req);
    await bootstrapAdminFromEnv();
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Access denied.' });
    }

    res.setHeader('Set-Cookie', createSessionCookie(user, req));
    return res.status(200).json({
      authenticated: true,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      passwordResetRequired: user.passwordResetRequired,
    });
  } catch {
    return res.status(400).json({ error: 'Invalid login request.' });
  }
}
