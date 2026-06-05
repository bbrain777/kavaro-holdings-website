import { getAdminSession, parseJsonBody } from './_admin-auth.js';
import { getUserById, updateUserPassword, verifyPassword } from './_users-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ error: 'Sign in required.' });

  try {
    const body = await parseJsonBody(req);
    const user = await getUserById(session.id);
    if (!user?.password_hash || !verifyPassword(body.currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    if (String(body.newPassword || '') !== String(body.confirmPassword || '')) {
      return res.status(400).json({ error: 'New passwords do not match.' });
    }

    const updatedUser = await updateUserPassword(session.id, body.newPassword);
    return res.status(200).json({ user: updatedUser, message: 'Password changed.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to change password.' });
  }
}
