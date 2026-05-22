import { kv } from '@vercel/kv';
import crypto from 'node:crypto';

const ORDERS_KEY = 'soap_shop_orders';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { orderId, customer, items, totalQuantity, subtotal, discountPercentage, discountAmount, finalTotal } = req.body;

      const order = {
        id: orderId || crypto.randomUUID(),
        customer,
        items: items || [],
        totalQuantity: totalQuantity || 0,
        subtotal: subtotal || 0,
        discountPercentage: discountPercentage || 0,
        discountAmount: discountAmount || 0,
        finalTotal: finalTotal || 0,
        submittedAt: new Date().toISOString(),
      };

      const orders = (await kv.get(ORDERS_KEY)) || [];
      orders.unshift(order);

      const MAX_ORDERS = 1000;
      if (orders.length > MAX_ORDERS) orders.length = MAX_ORDERS;

      await kv.set(ORDERS_KEY, orders);
      return res.status(200).json({ success: true, orderId: order.id });
    }

    if (req.method === 'GET') {
      const orders = (await kv.get(ORDERS_KEY)) || [];
      return res.status(200).json({ orders });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
