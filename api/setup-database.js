import { getAdminSession } from './_admin-auth.js';
import { ensureDatabaseSchema } from './_database-schema.js';
import { hasDatabase } from './_apartments-db.js';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ error: 'Admin access required.' });

  if (!hasDatabase()) {
    return res.status(500).json({
      configured: false,
      error: 'Database is not configured yet. Add Vercel Postgres environment variables first.',
    });
  }

  try {
    const result = await ensureDatabaseSchema();
    return res.status(200).json({
      ...result,
      message: 'KAVARO Postgres schema is ready.',
    });
  } catch (error) {
    return res.status(500).json({
      configured: true,
      error: error.message || 'Unable to prepare database schema.',
    });
  }
}
