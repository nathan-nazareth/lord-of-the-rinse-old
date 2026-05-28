module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');

  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return res.status(200).json([]);
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    return res.status(201).json({
      id: 1, percentage: body.percentage || 10, description: body.description || '',
      active: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
  }

  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    return res.status(200).json({
      id: 1, percentage: body.percentage || 10, description: body.description || '',
      active: body.active !== undefined ? body.active : 1,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};