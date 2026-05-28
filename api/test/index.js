const handler = async (req) => {
  try {
    return new Response(JSON.stringify({ ok: true, method: req.method }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

module.exports = handler;
exports.default = handler;