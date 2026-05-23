/// <reference types="vite/client" />

import { IconLoader2 } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Route = createFileRoute('/admin/orders/')({
  component: AdminOrders,
});

interface Order {
  id: string;
  reference: string;
  status: string;
  customerName: string;
  customerEmail: string;
  total: string;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 'new' | 'processing' | 'fulfilled' | 'cancelled';

const STATUS_BADGE: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
  processing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Processing' },
  fulfilled: { bg: 'bg-green-100', text: 'text-green-700', label: 'Fulfilled' },
  cancelled: { bg: 'bg-dusty/20', text: 'text-dusty', label: 'Cancelled' },
};

async function fetchOrders(status?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const res = await fetch(`${API_BASE}/api/admin/orders?${params}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  const data = await res.json();
  return data.orders;
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (Number.isNaN(num)) return price;
  return `$${num.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => fetchOrders(statusFilter || undefined),
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink/60">View and manage customer orders.</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium text-ink/50 uppercase tracking-wider">Filter:</span>
        {['', 'new', 'processing', 'fulfilled', 'cancelled'].map((status) => (
          <Button
            key={status || 'all'}
            variant={statusFilter === status ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status ? STATUS_BADGE[status as OrderStatus].label : 'All'}
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-ink/50">
          <IconLoader2 size={24} className="animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-ink/50">No orders found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wider text-ink/50">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const badge = STATUS_BADGE[order.status as OrderStatus] || STATUS_BADGE.new;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-ink/5 transition-colors hover:bg-botanical/5"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to="/admin/orders/$orderId"
                          params={{ orderId: order.id }}
                          className="font-mono text-xs font-medium text-botanical hover:underline"
                        >
                          {order.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{order.customerName}</div>
                        <div className="text-xs text-ink/50">{order.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink/80">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3 text-ink/60">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
