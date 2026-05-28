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

async function handleAdminAuthLogin(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (!body.password) {
    return jsonResponse({ error: 'Password is required' }, 400);
  }

  if (body.password !== ADMIN_PASSWORD) {
    return jsonResponse({ error: 'Invalid password' }, 401);
  }

  return jsonResponse({ token: `admin-${ADMIN_PASSWORD}` });
}

async function handleAdminProducts(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (req.method === 'GET') {
    return jsonResponse([]);
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
    return jsonResponse({
      id: 1, name: body.name || 'Test', color: body.color || 'blue',
      scent: body.scent || 'lavender', shape: body.shape || 'round',
      weight: body.weight || 100, price: body.price || 999,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }, 201);
  }

  if (req.method === 'DELETE') {
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleAdminOptions(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (req.method === 'GET') {
    return jsonResponse({ minPrice: 100, maxPrice: 10000, minSize: 50, maxSize: 500 });
  }

  if (req.method === 'PUT') {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
    return jsonResponse({ ...body, updatedAt: new Date().toISOString() });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleAdminDiscounts(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (req.method === 'GET') {
    return jsonResponse([]);
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
    return jsonResponse({
      id: 1, percentage: body.percentage || 10,
      description: body.description || 'Discount',
      active: 1, createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, 201);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleApiTest(req) {
  const url = new URL(req.url);
  return jsonResponse({ ok: true, method: req.method, url: url.pathname });
}

const handler = async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Route: /api/admin/auth/login
  if (pathname === '/api/admin/auth/login') {
    return handleAdminAuthLogin(req);
  }

  // Route: /api/admin/products
  if (pathname === '/api/admin/products') {
    return handleAdminProducts(req);
  }

  // Route: /api/admin/options
  if (pathname === '/api/admin/options') {
    return handleAdminOptions(req);
  }

  // Route: /api/admin/discounts
  if (pathname === '/api/admin/discounts') {
    return handleAdminDiscounts(req);
  }

  // Route: /api/test
  if (pathname === '/api/test') {
    return handleApiTest(req);
  }

  // 404 for unknown routes
  return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
};

module.exports = handler;
exports.default = handler;