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

  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (req.method === 'GET') {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    let body: { percentage: number; description: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ id: 1, percentage: body.percentage, description: body.description, active: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'PUT' && !isNaN(Number(lastSegment))) {
    let body: { percentage?: number; description?: string; active?: number };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ id: Number(lastSegment), percentage: body.percentage ?? 10, description: body.description ?? '', active: body.active ?? 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'DELETE' && !isNaN(Number(lastSegment))) {
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