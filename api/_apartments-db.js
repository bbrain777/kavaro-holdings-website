import { sql } from '@vercel/postgres';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apartmentsPath = resolve(dirname(fileURLToPath(import.meta.url)), '../data/apartments.json');
const defaultApartments = JSON.parse(readFileSync(apartmentsPath, 'utf8'));

export function hasDatabase() {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

export function normalizeApartmentRow(row) {
  return {
    id: row.id,
    apartmentName: row.apartment_name,
    location: row.location,
    addressArea: row.address_area,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    pricePerNight: Number(row.price_per_night || 0),
    pricePerWeek: Number(row.price_per_week || 0),
    pricePerMonth: Number(row.price_per_month || 0),
    cleaningFee: Number(row.cleaning_fee || 0),
    securityDeposit: Number(row.security_deposit || 0),
    maxGuests: Number(row.max_guests || 1),
    bedrooms: Number(row.bedrooms || 1),
    bathrooms: Number(row.bathrooms || 1),
    propertyType: row.property_type,
    availabilityStatus: row.availability_status,
    availableDates: row.available_dates || [],
    amenities: row.amenities || [],
    images: row.images || [],
    houseRules: row.house_rules || [],
    cancellationPolicy: row.cancellation_policy,
    isCustom: true,
  };
}

export async function ensureApartmentTable() {
  if (!hasDatabase()) return false;

  await sql`
    CREATE TABLE IF NOT EXISTS kavaro_apartments (
      id TEXT PRIMARY KEY,
      apartment_name TEXT NOT NULL,
      location TEXT NOT NULL,
      address_area TEXT,
      short_description TEXT,
      full_description TEXT,
      price_per_night NUMERIC DEFAULT 0,
      price_per_week NUMERIC DEFAULT 0,
      price_per_month NUMERIC DEFAULT 0,
      cleaning_fee NUMERIC DEFAULT 0,
      security_deposit NUMERIC DEFAULT 0,
      max_guests INTEGER DEFAULT 1,
      bedrooms INTEGER DEFAULT 1,
      bathrooms INTEGER DEFAULT 1,
      property_type TEXT,
      availability_status TEXT,
      available_dates JSONB DEFAULT '[]'::jsonb,
      amenities JSONB DEFAULT '[]'::jsonb,
      images JSONB DEFAULT '[]'::jsonb,
      house_rules JSONB DEFAULT '[]'::jsonb,
      cancellation_policy TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  return true;
}

export async function getDatabaseApartments() {
  if (!hasDatabase()) return [];

  await ensureApartmentTable();
  const { rows } = await sql`
    SELECT *
    FROM kavaro_apartments
    ORDER BY updated_at DESC
  `;
  return rows.map(normalizeApartmentRow);
}

export async function getAllApartments() {
  const databaseApartments = await getDatabaseApartments();
  return [...defaultApartments, ...databaseApartments];
}

export async function saveDatabaseApartment(apartment) {
  if (!hasDatabase()) throw new Error('Database is not configured yet.');

  await ensureApartmentTable();
  await sql`
    INSERT INTO kavaro_apartments (
      id, apartment_name, location, address_area, short_description, full_description,
      price_per_night, price_per_week, price_per_month, cleaning_fee, security_deposit,
      max_guests, bedrooms, bathrooms, property_type, availability_status, available_dates,
      amenities, images, house_rules, cancellation_policy, updated_at
    )
    VALUES (
      ${apartment.id}, ${apartment.apartmentName}, ${apartment.location}, ${apartment.addressArea || ''},
      ${apartment.shortDescription || ''}, ${apartment.fullDescription || apartment.shortDescription || ''},
      ${apartment.pricePerNight || 0}, ${apartment.pricePerWeek || 0}, ${apartment.pricePerMonth || 0},
      ${apartment.cleaningFee || 0}, ${apartment.securityDeposit || 0}, ${apartment.maxGuests || 1},
      ${apartment.bedrooms || 1}, ${apartment.bathrooms || 1}, ${apartment.propertyType || ''},
      ${apartment.availabilityStatus || 'Available'}, ${JSON.stringify(apartment.availableDates || [])}::jsonb,
      ${JSON.stringify(apartment.amenities || [])}::jsonb, ${JSON.stringify(apartment.images || [])}::jsonb,
      ${JSON.stringify(apartment.houseRules || [])}::jsonb, ${apartment.cancellationPolicy || ''}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      apartment_name = EXCLUDED.apartment_name,
      location = EXCLUDED.location,
      address_area = EXCLUDED.address_area,
      short_description = EXCLUDED.short_description,
      full_description = EXCLUDED.full_description,
      price_per_night = EXCLUDED.price_per_night,
      price_per_week = EXCLUDED.price_per_week,
      price_per_month = EXCLUDED.price_per_month,
      cleaning_fee = EXCLUDED.cleaning_fee,
      security_deposit = EXCLUDED.security_deposit,
      max_guests = EXCLUDED.max_guests,
      bedrooms = EXCLUDED.bedrooms,
      bathrooms = EXCLUDED.bathrooms,
      property_type = EXCLUDED.property_type,
      availability_status = EXCLUDED.availability_status,
      available_dates = EXCLUDED.available_dates,
      amenities = EXCLUDED.amenities,
      images = EXCLUDED.images,
      house_rules = EXCLUDED.house_rules,
      cancellation_policy = EXCLUDED.cancellation_policy,
      updated_at = NOW()
  `;

  return apartment;
}

export async function deleteDatabaseApartment(apartmentId) {
  if (!hasDatabase()) throw new Error('Database is not configured yet.');

  await ensureApartmentTable();
  await sql`DELETE FROM kavaro_apartments WHERE id = ${apartmentId}`;
}
