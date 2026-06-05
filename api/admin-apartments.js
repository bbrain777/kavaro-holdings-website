import { getAdminSession, hasRole, parseJsonBody } from './_admin-auth.js';
import { deleteDatabaseApartment, getDatabaseApartmentById, getDatabaseApartments, hasDatabase, saveDatabaseApartment } from './_apartments-db.js';

export default async function handler(req, res) {
  const session = getAdminSession(req);
  if (!hasRole(session, ['admin', 'staff'])) return res.status(401).json({ error: 'Staff or admin access required.' });

  if (!hasDatabase()) {
    return res.status(500).json({ error: 'Database is not configured yet. Add Vercel Postgres environment variables first.' });
  }

  try {
    if (req.method === 'GET') {
      const apartments = await getDatabaseApartments(session);
      return res.status(200).json({ apartments });
    }

    if (req.method === 'POST') {
      const apartment = await parseJsonBody(req);
      if (!apartment?.id || !apartment?.apartmentName || !apartment?.location) {
        return res.status(400).json({ error: 'Apartment name and location are required.' });
      }

      const existingApartment = await getDatabaseApartmentById(apartment.id);
      if (session.role === 'staff' && existingApartment && existingApartment.ownerId !== session.id) {
        return res.status(403).json({ error: 'Staff can only edit rentals they created.' });
      }

      await saveDatabaseApartment(apartment, session);
      const apartments = await getDatabaseApartments(session);
      return res.status(200).json({ apartment, apartments });
    }

    if (req.method === 'DELETE') {
      const { id } = await parseJsonBody(req);
      if (!id) return res.status(400).json({ error: 'Apartment ID is required.' });

      const existingApartment = await getDatabaseApartmentById(id);
      if (session.role === 'staff' && existingApartment?.ownerId !== session.id) {
        return res.status(403).json({ error: 'Staff can only delete rentals they created.' });
      }

      await deleteDatabaseApartment(id);
      const apartments = await getDatabaseApartments(session);
      return res.status(200).json({ apartments });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to update apartments.' });
  }
}
