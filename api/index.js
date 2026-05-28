module.exports = async function handler(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';
  
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
  
  if (pathname === '/api/admin/products') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== `admin-${ADMIN_PASSWORD}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.method === 'GET') {
      return res.status(200).json([]);
    }
    if (req.method === 'POST') {
      try {
        const body = JSON.parse(req.body);
        return res.status(201).json({
          id: 1, name: body?.name || 'Test', color: body?.color || 'blue',
          scent: body?.scent || 'lavender', shape: body?.shape || 'round',
          weight: body?.weight || 100, price: body?.price || 999,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        });
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }
    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (pathname === '/api/admin/options') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== `admin-${ADMIN_PASSWORD}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.method === 'GET') {
      return res.status(200).json({ minPrice: 100, maxPrice: 10000, minSize: 50, maxSize: 500 });
    }
    if (req.method === 'PUT') {
      try {
        const body = JSON.parse(req.body);
        return res.status(200).json({ ...body, updatedAt: new Date().toISOString() });
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (pathname === '/api/admin/discounts') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== `admin-${ADMIN_PASSWORD}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.method === 'GET') {
      return res.status(200).json([]);
    }
    if (req.method === 'POST') {
      try {
        const body = JSON.parse(req.body);
        return res.status(201).json({
          id: 1, percentage: body?.percentage || 10,
          description: body?.description || 'Discount',
          active: 1, createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (pathname === '/api/test') {
    return res.status(200).json({ ok: true, url: pathname });
  }
  
  return res.status(404).json({ error: 'Not Found' });
};