/// <reference types="vite/client" />

import { IconLoader2, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ProductionQueueItem {
  variantId: string | null;
  displayName: string;
  totalToProduce: number;
  orders: { reference: string; quantity: number }[];
}

async function fetchProductionQueue(): Promise<ProductionQueueItem[]> {
  const res = await fetch(`${API_BASE}/api/admin/production-queue`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch production queue');
  const data = await res.json();
  return data.queue;
}

export const Route = createFileRoute('/admin/production')({
  component: AdminProduction,
});

function AdminProduction() {
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['admin-production-queue'],
    queryFn: fetchProductionQueue,
  });

  const toggleExpand = (key: string) => {
    setExpandedVariant((prev) => (prev === key ? null : key));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Production Queue</h1>
        <p className="mt-1 text-sm text-ink/60">
          Variants that need to be produced for active orders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-ink/50">
          <IconLoader2 size={24} className="animate-spin" />
        </div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-12 text-center">
              <p className="text-sm text-ink/50">No production demand.</p>
              <p className="mt-1 text-xs text-ink/40">
                When orders contain items that cannot be fulfilled from stock, they will appear
                here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-ink/60">
            {queue.length} variant{queue.length !== 1 ? 's' : ''} with production demand
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wider text-ink/50">
                    <th className="w-8 px-4 py-3" />
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3 text-right">Qty to Produce</th>
                    <th className="px-4 py-3 text-right">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => {
                    const key = item.variantId || item.displayName;
                    const isExpanded = expandedVariant === key;
                    return (
                      <>
                        <tr
                          key={key}
                          className="cursor-pointer border-b border-ink/5 transition-colors hover:bg-botanical/5"
                          onClick={() => toggleExpand(key)}
                        >
                          <td className="px-4 py-3 text-ink/40">
                            {isExpanded ? (
                              <IconChevronDown size={16} />
                            ) : (
                              <IconChevronRight size={16} />
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-ink">{item.displayName}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                              {item.totalToProduce}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-ink/60">{item.orders.length}</td>
                        </tr>
                        {isExpanded && (
                          <tr
                            key={`${key}-detail`}
                            className="border-b border-ink/5 bg-parchment/50"
                          >
                            <td colSpan={4} className="px-4 py-0">
                              <div className="px-8 py-3">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs font-medium uppercase tracking-wider text-ink/40">
                                      <th className="pb-2 text-left">Order Reference</th>
                                      <th className="pb-2 text-right">Quantity</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.orders.map((order) => (
                                      <tr key={order.reference} className="border-t border-ink/5">
                                        <td className="py-1.5 font-mono text-xs text-ink/70">
                                          {order.reference}
                                        </td>
                                        <td className="py-1.5 text-right text-ink/70">
                                          {order.quantity}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
