import { getDatabaseApartments, hasDatabase } from './_apartments-db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apartments = await getDatabaseApartments();
    return res.status(200).json({
      configured: hasDatabase(),
      apartments,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to load apartments.' });
  }
}
