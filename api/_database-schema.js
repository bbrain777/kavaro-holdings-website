import { sql } from '@vercel/postgres';
import { ensureApartmentTable, hasDatabase } from './_apartments-db.js';

export async function ensureUserAccountTable() {
  if (!hasDatabase()) return false;

  await sql`
    CREATE TABLE IF NOT EXISTS kavaro_users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'guest',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE kavaro_users
    ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE
  `;

  return true;
}

export async function ensureBookingTable() {
  if (!hasDatabase()) return false;

  await sql`
    CREATE TABLE IF NOT EXISTS kavaro_bookings (
      id UUID PRIMARY KEY,
      apartment_id TEXT NOT NULL,
      user_id UUID REFERENCES kavaro_users(id) ON DELETE SET NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER DEFAULT 1,
      total_amount NUMERIC DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS kavaro_bookings_apartment_id_idx
    ON kavaro_bookings(apartment_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS kavaro_bookings_guest_email_idx
    ON kavaro_bookings(guest_email)
  `;

  return true;
}

export async function ensurePasswordOtpTable() {
  if (!hasDatabase()) return false;

  await sql`
    CREATE TABLE IF NOT EXISTS kavaro_password_otps (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES kavaro_users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'password_reset',
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS kavaro_password_otps_user_id_idx
    ON kavaro_password_otps(user_id)
  `;

  return true;
}

export async function ensureDatabaseSchema() {
  if (!hasDatabase()) return { configured: false, tables: [] };

  await ensureApartmentTable();
  await ensureUserAccountTable();
  await ensureBookingTable();
  await ensurePasswordOtpTable();

  return {
    configured: true,
    tables: ['kavaro_apartments', 'kavaro_users', 'kavaro_bookings', 'kavaro_password_otps'],
  };
}
