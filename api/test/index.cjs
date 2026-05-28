const handler = async (req) => {
  try {
    const url = new URL(req.url);
    return new Response(JSON.stringify({ 
      ok: true, 
      method: req.method,
      url: url.pathname,
      module: 'cjs'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

module.exports = handler;