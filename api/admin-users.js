import { getAdminSession, hasRole, parseJsonBody } from './_admin-auth.js';
import { createOrUpdateUser, listUsers, updateUserRole } from './_users-db.js';

export default async function handler(req, res) {
  const session = getAdminSession(req);
  if (!hasRole(session, ['admin'])) return res.status(401).json({ error: 'Admin access required.' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ users: await listUsers() });
    }

    if (req.method === 'POST') {
      const body = await parseJsonBody(req);
      const user = await createOrUpdateUser({
        email: body.email,
        fullName: body.fullName,
        phone: body.phone || '',
        role: body.role || 'user',
        password: body.password || '',
        passwordResetRequired: Boolean(body.password),
      });
      return res.status(200).json({ user, users: await listUsers() });
    }

    if (req.method === 'PATCH') {
      const body = await parseJsonBody(req);
      if (!body.id || !body.role) return res.status(400).json({ error: 'User ID and role are required.' });
      const user = await updateUserRole(body.id, body.role);
      return res.status(200).json({ user, users: await listUsers() });
    }

    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to manage users.' });
  }
}
