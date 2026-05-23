import { IconPlus, IconLoader2, IconFilter } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type MovementType = 'adjustment' | 'allocation' | 'cancellation_restock' | 'production';

const TYPE_LABELS: Record<MovementType, string> = {
  adjustment: 'Adjustment',
  allocation: 'Allocation',
  cancellation_restock: 'Restock (Cancellation)',
  production: 'Production',
};

interface StockLevel {
  variantId: string;
  variantName: string;
  stock: number;
}

interface StockMovement {
  id: string;
  variantId: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
}

interface AdjustFormData {
  variantId: string;
  quantity: number;
  reason: string;
}

async function fetchStockLevels(): Promise<StockLevel[]> {
  const res = await fetch(`${API_BASE}/api/admin/stock-movements/stock-levels`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch stock levels');
  const data = await res.json();
  return data.stockLevels;
}

async function fetchMovements(filters?: {
  variantId?: string;
  type?: string;
}): Promise<StockMovement[]> {
  const params = new URLSearchParams();
  if (filters?.variantId) params.set('variantId', filters.variantId);
  if (filters?.type) params.set('type', filters.type);

  const res = await fetch(`${API_BASE}/api/admin/stock-movements?${params}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch movements');
  const data = await res.json();
  return data.movements;
}

async function adjustStock(data: AdjustFormData): Promise<StockMovement> {
  const res = await fetch(`${API_BASE}/api/admin/stock-movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    if (body.currentStock !== undefined) {
      throw new Error(
        `Insufficient stock. Current: ${body.currentStock}, Requested change: ${body.requestedChange}`,
      );
    }
    throw new Error(body.error || 'Failed to adjust stock');
  }
  const body = await res.json();
  return body.movement;
}

export const Route = createFileRoute('/admin/stock')({
  component: AdminStock,
});

function AdminStock() {
  const queryClient = useQueryClient();
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustForm, setAdjustForm] = useState<AdjustFormData>({
    variantId: '',
    quantity: 0,
    reason: '',
  });
  const [filterVariantId, setFilterVariantId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: stockLevels = [], isLoading: levelsLoading } = useQuery({
    queryKey: ['admin-stock-levels'],
    queryFn: fetchStockLevels,
  });

  const { data: movements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ['admin-stock-movements', filterVariantId, filterType],
    queryFn: () =>
      fetchMovements({
        variantId: filterVariantId || undefined,
        type: filterType || undefined,
      }),
  });

  const adjustMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stock-levels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stock-movements'] });
      setAdjustForm({ variantId: '', quantity: 0, reason: '' });
      setShowAdjustForm(false);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustMutation.mutate(adjustForm);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Stock Management</h1>
          <p className="mt-1 text-sm text-ink/60">
            View inventory levels and adjust stock quantities.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAdjustForm(true);
            setError(null);
          }}
        >
          <IconPlus size={16} />
          Adjust Stock
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stock Levels Table */}
      <h2 className="mb-3 text-lg font-semibold text-ink">Current Stock Levels</h2>
      {levelsLoading ? (
        <div className="flex items-center justify-center py-12 text-ink/50">
          <IconLoader2 size={24} className="animate-spin" />
        </div>
      ) : stockLevels.length === 0 ? (
        <Card className="mb-8">
          <CardContent>
            <p className="py-8 text-center text-sm text-ink/50">No variants found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wider text-ink/50">
                  <th className="px-4 py-3">Variant</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.map((level) => (
                  <tr
                    key={level.variantId}
                    className="border-b border-ink/5 transition-colors hover:bg-botanical/5"
                  >
                    <td className="px-4 py-3 font-medium text-ink">{level.variantName}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          level.stock <= 0
                            ? 'bg-red-100 text-red-700'
                            : level.stock <= 10
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {level.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Adjust Stock Form */}
      {showAdjustForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Adjust Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-56">
                  <label
                    htmlFor="adjust-variant"
                    className="mb-1 block text-xs font-medium text-ink/70"
                  >
                    Variant
                  </label>
                  <select
                    id="adjust-variant"
                    value={adjustForm.variantId}
                    onChange={(e) =>
                      setAdjustForm((prev) => ({ ...prev, variantId: e.target.value }))
                    }
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    required
                  >
                    <option value="">Select variant...</option>
                    {stockLevels.map((v) => (
                      <option key={v.variantId} value={v.variantId}>
                        {v.variantName} (stock: {v.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label
                    htmlFor="adjust-qty"
                    className="mb-1 block text-xs font-medium text-ink/70"
                  >
                    Quantity
                  </label>
                  <input
                    id="adjust-qty"
                    type="number"
                    value={adjustForm.quantity}
                    onChange={(e) =>
                      setAdjustForm((prev) => ({
                        ...prev,
                        quantity: Number.parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    placeholder="e.g. 10 or -5"
                    required
                  />
                </div>
                <div className="w-56">
                  <label
                    htmlFor="adjust-reason"
                    className="mb-1 block text-xs font-medium text-ink/70"
                  >
                    Reason
                  </label>
                  <input
                    id="adjust-reason"
                    type="text"
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    placeholder="e.g. New batch produced"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-ink/50">
                Use positive numbers to add stock, negative to remove. Stock cannot go below 0.
              </p>
              <div className="flex gap-2">
                <Button type="submit" disabled={adjustMutation.isPending}>
                  {adjustMutation.isPending ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : null}
                  Apply Adjustment
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAdjustForm(false);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Movement Ledger */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Movement Ledger</h2>
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <IconFilter size={14} />
          Filters
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-48">
                <label
                  htmlFor="filter-variant"
                  className="mb-1 block text-xs font-medium text-ink/70"
                >
                  Variant
                </label>
                <select
                  id="filter-variant"
                  value={filterVariantId}
                  onChange={(e) => setFilterVariantId(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="">All variants</option>
                  {stockLevels.map((v) => (
                    <option key={v.variantId} value={v.variantId}>
                      {v.variantName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-40">
                <label htmlFor="filter-type" className="mb-1 block text-xs font-medium text-ink/70">
                  Type
                </label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="">All types</option>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterVariantId('');
                  setFilterType('');
                }}
              >
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {movementsLoading ? (
        <div className="flex items-center justify-center py-12 text-ink/50">
          <IconLoader2 size={24} className="animate-spin" />
        </div>
      ) : movements.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-ink/50">No stock movements recorded.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wider text-ink/50">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Variant</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  const variant = stockLevels.find((s) => s.variantId === m.variantId);
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-ink/5 transition-colors hover:bg-botanical/5"
                    >
                      <td className="px-4 py-3 text-ink/60">{formatDate(m.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {variant?.variantName || m.variantId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-botanical/10 px-2 py-0.5 text-xs text-botanical">
                          {TYPE_LABELS[m.type] || m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-mono text-xs font-medium ${
                            m.quantity > 0
                              ? 'text-green-600'
                              : m.quantity < 0
                                ? 'text-red-600'
                                : 'text-ink/50'
                          }`}
                        >
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/60">{m.reason || '-'}</td>
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
