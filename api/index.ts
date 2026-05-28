const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

export default function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === '/api/admin/auth/login') {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    return req.json().then(body => {
      if (!body || !body.password) {
        return jsonResponse({ error: 'Password is required' }, 400);
      }
      if (body.password !== ADMIN_PASSWORD) {
        return jsonResponse({ error: 'Invalid password' }, 401);
      }
      return jsonResponse({ token: `admin-${ADMIN_PASSWORD}` });
    }).catch(() => jsonResponse({ error: 'Invalid JSON' }, 400));
  }

  if (pathname === '/api/admin/products') {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== `admin-${ADMIN_PASSWORD}`) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    if (req.method === 'GET') {
      return jsonResponse([]);
    }
    if (req.method === 'POST') {
      return req.json().then(body => jsonResponse({
        id: 1, name: body?.name || 'Test', color: body?.color || 'blue',
        scent: body?.scent || 'lavender', shape: body?.shape || 'round',
        weight: body?.weight || 100, price: body?.price || 999,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }, 201)).catch(() => jsonResponse({ error: 'Invalid JSON' }, 400));
    }
    if (req.method === 'DELETE') {
      return jsonResponse({ success: true });
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (pathname === '/api/admin/options') {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== `admin-${ADMIN_PASSWORD}`) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    if (req.method === 'GET') {
      return jsonResponse({ minPrice: 100, maxPrice: 10000, minSize: 50, maxSize: 500 });
    }
    if (req.method === 'PUT') {
      return req.json().then(body => jsonResponse({ ...body, updatedAt: new Date().toISOString() }))
        .catch(() => jsonResponse({ error: 'Invalid JSON' }, 400));
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (pathname === '/api/admin/discounts') {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== `admin-${ADMIN_PASSWORD}`) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    if (req.method === 'GET') {
      return jsonResponse([]);
    }
    if (req.method === 'POST') {
      return req.json().then(body => jsonResponse({
        id: 1, percentage: body?.percentage || 10,
        description: body?.description || 'Discount',
        active: 1, createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, 201)).catch(() => jsonResponse({ error: 'Invalid JSON' }, 400));
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (pathname === '/api/test') {
    return jsonResponse({ ok: true, method: req.method, url: pathname });
  }

  return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
}