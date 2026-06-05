import { getAdminSession } from './_admin-auth.js';

export default function handler(req, res) {
  const session = getAdminSession(req);
  return res.status(200).json({
    authenticated: Boolean(session),
    email: session?.email || '',
    fullName: session?.fullName || '',
    role: session?.role || '',
    id: session?.id || '',
  });
}
