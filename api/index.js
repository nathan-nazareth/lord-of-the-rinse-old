module.exports = async function handler(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  const pathname = req.url;
  
  if (pathname === '/api/admin/auth/login') {
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    let body;
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    
    if (!body || !body.password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (body.password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    return res.status(200).json({ token: `admin-${ADMIN_PASSWORD}` });
  }
  
  if (pathname === '/api/test') {
    return res.status(200).json({ ok: true, url: pathname });
  }
  
  return res.status(404).json({ error: 'Not Found' });
};