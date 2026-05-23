/// <reference types="vite/client" />

import { IconLoader2, IconArrowLeft } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Route = createFileRoute('/admin/orders/$orderId')({
  component: AdminOrderDetail,
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

interface OrderLine {
  id: string;
  orderId: string;
  variantId: string | null;
  displayName: string;
  quantity: number;
  unitPrice: string;
  allocatedFromStock: number;
  quantityToProduce: number;
  createdAt: string;
}

interface NotificationAttempt {
  id: string;
  orderId: string;
  provider: string;
  status: string;
  attempts: number;
  lastError: string | null;
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

const VALID_TRANSITIONS: Record<
  string,
  { status: OrderStatus; label: string; variant: 'default' | 'destructive' }[]
> = {
  new: [
    { status: 'processing', label: 'Start Processing', variant: 'default' },
    { status: 'cancelled', label: 'Cancel', variant: 'destructive' },
  ],
  processing: [
    { status: 'fulfilled', label: 'Mark Fulfilled', variant: 'default' },
    { status: 'cancelled', label: 'Cancel', variant: 'destructive' },
  ],
  fulfilled: [],
  cancelled: [],
};

const NOTIF_STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  sent: { bg: 'bg-green-100', text: 'text-green-700' },
  failed: { bg: 'bg-red-100', text: 'text-red-700' },
};

async function fetchOrder(
  orderId: string,
): Promise<{ order: Order; lines: OrderLine[]; notifications: NotificationAttempt[] }> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to update status');
  }
  const body = await res.json();
  return body.order;
}

async function retryNotification(orderId: string): Promise<NotificationAttempt> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/retry-notification`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to retry notification');
  }
  const body = await res.json();
  return body.notification;
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

function AdminOrderDetail() {
  const { orderId } = Route.useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const retryMutation = useMutation({
    mutationFn: () => retryNotification(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-ink/50">
        <IconLoader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-ink/50">Order not found.</p>
      </div>
    );
  }

  const { order, lines, notifications } = data;
  const badge = STATUS_BADGE[order.status as OrderStatus] || STATUS_BADGE.new;
  const transitions = VALID_TRANSITIONS[order.status] || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            to="/admin/orders"
            className="mb-2 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink"
          >
            <IconArrowLeft size={14} />
            Back to Orders
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink">{order.reference}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
            >
              {badge.label}
            </span>
            <span className="text-sm text-ink/50">{formatDate(order.createdAt)}</span>
          </div>
        </div>
        {/* Status transition buttons */}
        {transitions.length > 0 && (
          <div className="flex items-center gap-2">
            {transitions.map((t) => (
              <Button
                key={t.status}
                variant={t.variant === 'destructive' ? 'destructive' : 'default'}
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate(t.status)}
              >
                {statusMutation.isPending ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : null}
                {t.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                  Name
                </span>
                <p className="font-medium text-ink">{order.customerName}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                  Email
                </span>
                <p className="text-ink">{order.customerEmail}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                  Total
                </span>
                <p className="text-lg font-semibold text-ink">{formatPrice(order.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-ink/50">No notification attempts.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => {
                  const nBadge = NOTIF_STATUS_BADGE[n.status] || NOTIF_STATUS_BADGE.pending;
                  const canRetry = n.status === 'pending' || n.status === 'failed';
                  return (
                    <div key={n.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">{n.provider}</span>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${nBadge.bg} ${nBadge.text}`}
                        >
                          {n.status}
                        </span>
                        {canRetry && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto h-7 text-xs"
                            disabled={retryMutation.isPending}
                            onClick={() => retryMutation.mutate()}
                          >
                            {retryMutation.isPending ? (
                              <IconLoader2 size={12} className="animate-spin" />
                            ) : null}
                            Retry
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-ink/50">
                        {n.attempts} attempt{n.attempts !== 1 ? 's' : ''}
                        {n.lastError && (
                          <span className="ml-2 text-red-500">Error: {n.lastError}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                  Created
                </span>
                <p className="text-sm text-ink">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                  Updated
                </span>
                <p className="text-sm text-ink">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Lines */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wider text-ink/50">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Line Total</th>
                <th className="px-4 py-3 text-right">Allocated</th>
                <th className="px-4 py-3 text-right">To Produce</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{line.displayName}</td>
                  <td className="px-4 py-3 text-right text-ink/80">{line.quantity}</td>
                  <td className="px-4 py-3 text-right text-ink/80">
                    {formatPrice(line.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink">
                    {formatPrice((parseFloat(line.unitPrice) * line.quantity).toFixed(2))}
                  </td>
                  <td className="px-4 py-3 text-right text-ink/60">{line.allocatedFromStock}</td>
                  <td className="px-4 py-3 text-right text-ink/60">{line.quantityToProduce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
