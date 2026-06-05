import { parseJsonBody } from './_admin-auth.js';
import { createPasswordOtp, sendOtpEmail } from './_users-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = await parseJsonBody(req);
    const otp = await createPasswordOtp(email);

    if (otp) {
      await sendOtpEmail(otp.user.email, otp.code);
    }

    return res.status(200).json({
      message: 'If the email exists, a password reset OTP has been sent.',
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to request OTP.' });
  }
}
