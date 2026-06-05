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

export async function ensureDatabaseSchema() {
  if (!hasDatabase()) return { configured: false, tables: [] };

  await ensureApartmentTable();
  await ensureUserAccountTable();
  await ensureBookingTable();

  return {
    configured: true,
    tables: ['kavaro_apartments', 'kavaro_users', 'kavaro_bookings'],
  };
}
