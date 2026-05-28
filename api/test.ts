export default async function handler(req: Request) {
  return new Response(JSON.stringify({ ok: true, method: req.method }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}