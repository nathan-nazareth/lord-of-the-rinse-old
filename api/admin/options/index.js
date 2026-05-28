module.exports = async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');

  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ id: 1, minPrice: 1, maxPrice: 100, minSize: 50, maxSize: 500, updatedAt: new Date().toISOString() }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'PUT') {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({
      id: 1, minPrice: body.minPrice || 1, maxPrice: body.maxPrice || 100,
      minSize: body.minSize || 50, maxSize: body.maxSize || 500,
      updatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
};