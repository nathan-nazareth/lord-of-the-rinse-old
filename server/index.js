import express from "express";
import cors from "cors";
import Database from "better-sqlite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "orders.db"));

db.exec(`
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

app.get("/admin/orders", auth, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC").all();
  res.json(orders);
});

app.post("/admin/orders", auth, (req, res) => {
  const { order_id, customer_name, customer_email, customer_phone, items, total_quantity, subtotal, discount_percent, discount_amount, final_total, submitted_at } = req.body;

  try {
    db.prepare(`
      INSERT OR REPLACE INTO orders (id, customer_name, customer_email, customer_phone, items, total_quantity, subtotal, discount_percent, discount_amount, final_total, status, created_at, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(order_id, customer_name, customer_email, customer_phone, items, total_quantity, subtotal, discount_percent, discount_amount, final_total, new Date().toISOString(), submitted_at);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/admin/orders/:id/close", auth, (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE orders SET status = 'closed' WHERE id = ?").run(id);
  res.json({ success: true });
});

app.listen(3000, () => console.log("Admin backend running on port 3000"));