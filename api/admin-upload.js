import { put } from '@vercel/blob';
import { getAdminSession, hasRole } from './_admin-auth.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readBuffer(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getAdminSession(req);
  if (!hasRole(session, ['admin', 'staff'])) return res.status(401).json({ error: 'Staff or admin access required.' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'Vercel Blob is not configured yet.' });
  }

  try {
    const filename = String(req.headers['x-file-name'] || `apartment-${Date.now()}.jpg`)
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-');
    const contentType = String(req.headers['content-type'] || 'application/octet-stream');
    const body = await readBuffer(req);

    if (!body.length) return res.status(400).json({ error: 'No file uploaded.' });
    if (body.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Image must be 5 MB or smaller.' });

    const blob = await put(`apartments/${Date.now()}-${filename}`, body, {
      access: 'public',
      contentType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to upload image.' });
  }
}
