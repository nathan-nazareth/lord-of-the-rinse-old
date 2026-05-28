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
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    return new Response(JSON.stringify({ id: 1, name: 'Test', color: 'blue', scent: 'lavender', shape: 'round', weight: 100, price: 9.99, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}