import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: string;
  total_quantity: number;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  final_total: number;
  status: string;
  created_at: string;
  submitted_at: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (key !== "3984") {
      setError("Invalid admin key");
      return;
    }
    setIsAuthenticated(true);
    setError("");
    await fetchOrders();
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const backendUrl = (window as any).__env__?.VITE_ADMIN_BACKEND_URL;
      const res = await fetch(`${backendUrl}/admin/orders`, {
        headers: { "x-admin-key": "3984" }
      });
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeOrder = async (id: string) => {
    try {
      const backendUrl = (window as any).__env__?.VITE_ADMIN_BACKEND_URL;
      await fetch(`${backendUrl}/admin/orders/${id}/close`, {
        method: "PATCH",
        headers: { "x-admin-key": "3984" }
      });
      setOrders(orders.filter(o => o.id !== id));
    } catch {
      console.error("Failed to close order");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-4">
        <div className="card-apothecary p-8 w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink-700 mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter admin key"
                className="input-apothecary w-full"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button type="submit" className="btn-apothecary btn-primary btn-full">
              Login
            </button>
          </form>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-ink-400 text-sm hover:text-terra-500 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-ink-700">Pending Orders</h1>
          <div className="flex gap-2">
            <button onClick={fetchOrders} className="btn-apothecary btn-secondary text-sm py-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => navigate("/")} className="btn-apothecary btn-secondary text-sm py-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-ink-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="card-apothecary p-8 text-center">
            <p className="text-ink-500 text-lg">No pending orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card-apothecary p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-display font-semibold text-lg text-ink-700">{order.customer_name}</p>
                    <p className="text-ink-400 text-sm">{order.customer_email}</p>
                    {order.customer_phone && <p className="text-ink-400 text-sm">{order.customer_phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold text-terra-500">Rs. {order.final_total}</p>
                    <p className="text-ink-400 text-xs">Order #{order.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="bg-parchment-100 rounded-xl p-4 mb-4 font-mono text-sm whitespace-pre-wrap text-ink-600">
                  {order.items}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-ink-400">
                    <p>{order.total_quantity} soaps | {order.discount_percent}% discount</p>
                    <p className="text-xs">Submitted: {new Date(order.submitted_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => closeOrder(order.id)}
                    className="btn-apothecary btn-primary text-sm py-2 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Close Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;