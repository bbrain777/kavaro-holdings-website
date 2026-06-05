import { parseJsonBody } from './_admin-auth.js';
import { verifyPasswordOtp } from './_users-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    if (String(body.newPassword || '') !== String(body.confirmPassword || '')) {
      return res.status(400).json({ error: 'New passwords do not match.' });
    }

    await verifyPasswordOtp(body.email, body.code, body.newPassword);
    return res.status(200).json({ message: 'Password reset complete. You can sign in now.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to reset password.' });
  }
}
