module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (!body.password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  return res.status(200).json({ token: `admin-${ADMIN_PASSWORD}` });
};