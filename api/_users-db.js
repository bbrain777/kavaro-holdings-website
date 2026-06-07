import { randomBytes, randomUUID, pbkdf2Sync, timingSafeEqual, createHash } from 'node:crypto';
import { sql } from '@vercel/postgres';
import { ensurePasswordOtpTable, ensureUserAccountTable } from './_database-schema.js';
import { hasDatabase } from './_apartments-db.js';

const passwordIterations = 120000;
const passwordKeyLength = 32;
const passwordDigest = 'sha256';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeRole(role) {
  return ['admin', 'staff', 'partner', 'partner_pending', 'user'].includes(role) ? role : 'user';
}

function normalizeUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone || '',
    role: row.role,
    googleSub: row.google_sub || '',
    authProvider: row.auth_provider || 'password',
    partnerRequestedAt: row.partner_requested_at || null,
    passwordResetRequired: Boolean(row.password_reset_required),
    createdAt: row.created_at,
  };
}

function hashOtp(code) {
  return createHash('sha256').update(String(code)).digest('hex');
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(String(password), salt, passwordIterations, passwordKeyLength, passwordDigest).toString('hex');
  return `pbkdf2:${passwordIterations}:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [scheme, iterations, salt, hash] = String(storedHash || '').split(':');
  if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false;

  const candidate = pbkdf2Sync(String(password), salt, Number(iterations), passwordKeyLength, passwordDigest).toString('hex');
  const candidateBuffer = Buffer.from(candidate, 'hex');
  const hashBuffer = Buffer.from(hash, 'hex');
  return candidateBuffer.length === hashBuffer.length && timingSafeEqual(candidateBuffer, hashBuffer);
}

export async function getUserByEmail(email) {
  if (!hasDatabase()) return null;

  await ensureUserAccountTable();
  const { rows } = await sql`
    SELECT *
    FROM kavaro_users
    WHERE email = ${normalizeEmail(email)}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getUserById(userId) {
  if (!hasDatabase()) return null;

  await ensureUserAccountTable();
  const { rows } = await sql`
    SELECT *
    FROM kavaro_users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getPublicUserById(userId) {
  return normalizeUserRow(await getUserById(userId));
}

export async function listUsers() {
  if (!hasDatabase()) return [];

  await ensureUserAccountTable();
  const { rows } = await sql`
    SELECT id, email, full_name, phone, role, password_reset_required, created_at
    FROM kavaro_users
    ORDER BY created_at DESC
  `;
  return rows.map(normalizeUserRow);
}

export async function createOrUpdateUser({ id, email, fullName, phone = '', role = 'user', password = '', passwordResetRequired = false }) {
  if (!hasDatabase()) throw new Error('Database is not configured yet.');

  await ensureUserAccountTable();
  const userId = id || randomUUID();
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = normalizeRole(role);
  const passwordHash = password ? hashPassword(password) : null;

  if (!normalizedEmail || !fullName) {
    throw new Error('Name and email are required.');
  }

  if (passwordHash) {
    await sql`
      INSERT INTO kavaro_users (
        id, email, full_name, phone, password_hash, role, password_reset_required, updated_at
      )
      VALUES (
        ${userId}, ${normalizedEmail}, ${fullName}, ${phone}, ${passwordHash}, ${normalizedRole}, ${passwordResetRequired}, NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        password_reset_required = EXCLUDED.password_reset_required,
        updated_at = NOW()
    `;
  } else {
    await sql`
      INSERT INTO kavaro_users (
        id, email, full_name, phone, role, password_reset_required, updated_at
      )
      VALUES (
        ${userId}, ${normalizedEmail}, ${fullName}, ${phone}, ${normalizedRole}, ${passwordResetRequired}, NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        password_reset_required = EXCLUDED.password_reset_required,
        updated_at = NOW()
    `;
  }

  return normalizeUserRow(await getUserByEmail(normalizedEmail));
}

export async function createOrUpdateGoogleUser({ email, fullName, googleSub }) {
  if (!hasDatabase()) throw new Error('Database is not configured yet.');

  await ensureUserAccountTable();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !fullName || !googleSub) {
    throw new Error('Google account details are incomplete.');
  }

  const existingByEmail = await getUserByEmail(normalizedEmail);
  const userId = existingByEmail?.id || randomUUID();
  const existingRole = existingByEmail?.role || 'user';

  await sql`
    INSERT INTO kavaro_users (
      id, email, full_name, phone, role, google_sub, auth_provider, updated_at
    )
    VALUES (
      ${userId}, ${normalizedEmail}, ${fullName}, ${existingByEmail?.phone || ''},
      ${normalizeRole(existingRole)}, ${googleSub}, 'google', NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      google_sub = EXCLUDED.google_sub,
      auth_provider = 'google',
      updated_at = NOW()
  `;

  return normalizeUserRow(await getUserByEmail(normalizedEmail));
}

export async function bootstrapAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || !hasDatabase()) return null;

  const existing = await getUserByEmail(email);
  if (existing?.role === 'admin') return normalizeUserRow(existing);
  if (existing) {
    return createOrUpdateUser({
      email,
      fullName: existing.full_name || 'KAVARO Administrator',
      phone: existing.phone || '',
      role: 'admin',
      password: existing.password_hash ? '' : password,
    });
  }

  return createOrUpdateUser({
    email,
    fullName: 'KAVARO Administrator',
    role: 'admin',
    password,
  });
}

export async function authenticateUser(email, password) {
  if (!hasDatabase()) {
    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword && normalizeEmail(email) === adminEmail && String(password) === String(adminPassword)) {
      return {
        id: 'local-admin',
        email: adminEmail,
        fullName: 'KAVARO Administrator',
        phone: '',
        role: 'admin',
        authProvider: 'password',
        passwordResetRequired: false,
        createdAt: null,
      };
    }
  }

  const user = await getUserByEmail(email);
  if (!user?.password_hash || !verifyPassword(password, user.password_hash)) return null;
  return normalizeUserRow(user);
}

export async function updateUserPassword(userId, password) {
  if (!password || String(password).length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  await ensureUserAccountTable();
  await sql`
    UPDATE kavaro_users
    SET password_hash = ${hashPassword(password)},
        password_reset_required = FALSE,
        updated_at = NOW()
    WHERE id = ${userId}
  `;
  return getPublicUserById(userId);
}

export async function updateUserRole(userId, role) {
  await ensureUserAccountTable();
  await sql`
    UPDATE kavaro_users
    SET role = ${normalizeRole(role)},
        updated_at = NOW()
    WHERE id = ${userId}
  `;
  return getPublicUserById(userId);
}

export async function requestPartnerPrivileges(userId) {
  await ensureUserAccountTable();
  const user = await getPublicUserById(userId);
  if (!user) throw new Error('Account not found.');
  if (user.role === 'admin' || user.role === 'partner') return user;

  await sql`
    UPDATE kavaro_users
    SET role = 'partner_pending',
        partner_requested_at = COALESCE(partner_requested_at, NOW()),
        updated_at = NOW()
    WHERE id = ${userId}
  `;
  return getPublicUserById(userId);
}

export async function createPasswordOtp(email) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  await ensurePasswordOtpTable();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await sql`
    INSERT INTO kavaro_password_otps (id, user_id, code_hash, expires_at)
    VALUES (${randomUUID()}, ${user.id}, ${hashOtp(code)}, NOW() + INTERVAL '15 minutes')
  `;

  return { code, user: normalizeUserRow(user) };
}

export async function verifyPasswordOtp(email, code, newPassword) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error('Invalid or expired OTP.');

  await ensurePasswordOtpTable();
  const { rows } = await sql`
    SELECT *
    FROM kavaro_password_otps
    WHERE user_id = ${user.id}
      AND code_hash = ${hashOtp(code)}
      AND used_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (!rows[0]) throw new Error('Invalid or expired OTP.');

  await updateUserPassword(user.id, newPassword);
  await sql`
    UPDATE kavaro_password_otps
    SET used_at = NOW()
    WHERE id = ${rows[0].id}
  `;

  return normalizeUserRow(user);
}

export async function sendOtpEmail(email, code) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`KAVARO password OTP for ${email}: ${code}`);
    return { sent: false, provider: 'console' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.OTP_EMAIL_FROM || 'KAVARO Holdings <noreply@kavaroholdings.com>',
      to: [email],
      subject: 'Your KAVARO password reset code',
      text: `Your KAVARO password reset code is ${code}. It expires in 15 minutes.`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Unable to send OTP email.');
  }

  return { sent: true, provider: 'resend' };
}
