import fs from 'node:fs';
import path from 'node:path';


const ORDERS_KEY = 'soap_shop_orders';
const DATA_DIR = '/tmp';
const DATA_FILE = path.join(DATA_DIR, `${ORDERS_KEY}.json`);

function readOrders() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading orders file:', e);
  }
  return [];
}

function writeOrders(orders) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing orders file:', e);
  }
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { orderId, customer, items, totalQuantity, subtotal, discountPercentage, discountAmount, finalTotal } = req.body;

      const order = {
        id: orderId || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)),
        customer,
        items: items || [],
        totalQuantity: totalQuantity || 0,
        subtotal: subtotal || 0,
        discountPercentage: discountPercentage || 0,
        discountAmount: discountAmount || 0,
        finalTotal: finalTotal || 0,
        submittedAt: new Date().toISOString(),
      };

      const orders = readOrders();
      orders.unshift(order);
      if (orders.length > 1000) orders.length = 1000;
      writeOrders(orders);

      return res.status(200).json({ success: true, orderId: order.id });
    }

    if (req.method === 'GET') {
      const orders = readOrders();
      return res.status(200).json({ orders });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
