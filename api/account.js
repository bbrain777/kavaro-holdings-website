import { createSessionCookie, getAdminSession, parseJsonBody } from './_admin-auth.js';
import {
  createOrUpdateUser,
  createPasswordOtp,
  getUserByEmail,
  getUserById,
  requestPartnerPrivileges,
  sendOtpEmail,
  updateUserPassword,
  verifyPassword,
  verifyPasswordOtp,
} from './_users-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseJsonBody(req);

    if (body.action === 'signup') {
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
    }

    if (body.action === 'change-password') {
      const session = getAdminSession(req);
      if (!session) return res.status(401).json({ error: 'Sign in required.' });

      const user = await getUserById(session.id);
      if (!user?.password_hash || !verifyPassword(body.currentPassword, user.password_hash)) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      if (String(body.newPassword || '') !== String(body.confirmPassword || '')) {
        return res.status(400).json({ error: 'New passwords do not match.' });
      }

      const updatedUser = await updateUserPassword(session.id, body.newPassword);
      return res.status(200).json({ user: updatedUser, message: 'Password changed.' });
    }

    if (body.action === 'request-partner') {
      const session = getAdminSession(req);
      if (!session) return res.status(401).json({ error: 'Sign in required.' });

      const user = await requestPartnerPrivileges(session.id);
      res.setHeader('Set-Cookie', createSessionCookie(user, req));
      return res.status(200).json({
        user,
        message: user.role === 'partner'
          ? 'Your partner access is already active.'
          : 'Your partner request has been sent for admin approval.',
      });
    }

    if (body.action === 'request-otp') {
      const otp = await createPasswordOtp(body.email);

      if (otp) {
        await sendOtpEmail(otp.user.email, otp.code);
      }

      return res.status(200).json({
        message: 'If the email exists, a password reset OTP has been sent.',
        emailConfigured: Boolean(process.env.RESEND_API_KEY),
      });
    }

    if (body.action === 'reset-password') {
      if (String(body.newPassword || '') !== String(body.confirmPassword || '')) {
        return res.status(400).json({ error: 'New passwords do not match.' });
      }

      await verifyPasswordOtp(body.email, body.code, body.newPassword);
      return res.status(200).json({ message: 'Password reset complete. You can sign in now.' });
    }

    return res.status(400).json({ error: 'Unknown account action.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to update account.' });
  }
}
