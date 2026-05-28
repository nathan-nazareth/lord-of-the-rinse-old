const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3984';

const adminAuth = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: true, message: 'Unauthorized' };
  }
  const token = authHeader.replace('Bearer ', '');
  if (token !== `admin-${ADMIN_PASSWORD}`) {
    return { error: true, message: 'Invalid admin token' };
  }
  return null;
};

export default async function handler(req: Request) {
  const authError = adminAuth(req);
  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ id: 1, minPrice: 1, maxPrice: 100, minSize: 50, maxSize: 500, updatedAt: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'PUT') {
    return new Response(JSON.stringify({ id: 1, minPrice: 1, maxPrice: 100, minSize: 50, maxSize: 500, updatedAt: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}