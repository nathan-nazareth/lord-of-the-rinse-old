import { createClient } from "@libsql/client";
import express from "express";
import cors from "cors";

const db = createClient({
  url: process.env.DATABASE_URL || "file:/data/orders.db",
});

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_KEY = "3984";

function auth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      items TEXT,
      total_quantity INTEGER,
      subtotal REAL,
      discount_percent INTEGER,
      discount_amount REAL,
      final_total REAL,
      status TEXT DEFAULT 'pending',
      created_at TEXT,
      submitted_at TEXT
    )
  `);
}
initDb();

app.get("/admin/orders", auth, async (req, res) => {
  const result = await db.execute(
    "SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

app.post("/admin/orders", auth, async (req, res) => {
  const { order_id, customer_name, customer_email, customer_phone, items, total_quantity, subtotal, discount_percent, discount_amount, final_total, submitted_at } = req.body;

  try {
    await db.execute({
      sql: `INSERT OR REPLACE INTO orders (id, customer_name, customer_email, customer_phone, items, total_quantity, subtotal, discount_percent, discount_amount, final_total, status, created_at, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      args: [order_id, customer_name, customer_email, customer_phone, items, total_quantity, subtotal, discount_percent, discount_amount, final_total, new Date().toISOString(), submitted_at]
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/admin/orders/:id/close", auth, async (req, res) => {
  const { id } = req.params;
  await db.execute({
    sql: "UPDATE orders SET status = 'closed' WHERE id = ?",
    args: [id]
  });
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Admin backend running on port ${PORT}`));