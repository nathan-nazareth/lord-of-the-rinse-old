import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { IconLoader2, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface SettingRow {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

interface DiscountTier {
  _id: number;
  minItems: number;
  percent: number;
}

let nextTierId = 1;
function makeTier(minItems: number, percent: number): DiscountTier {
  return { _id: nextTierId++, minItems, percent };
}

interface SettingsForm {
  shopOpen: boolean;
  currency: string;
  discountTiers: DiscountTier[];
  contactEmail: string;
}

const DEFAULT_SETTINGS: SettingsForm = {
  shopOpen: true,
  currency: 'USD',
  discountTiers: [makeTier(2, 10), makeTier(4, 15)],
  contactEmail: '',
};

function parseSettings(rows: SettingRow[]): SettingsForm {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    shopOpen: map.get('shop_open') !== 'false',
    currency: map.get('currency') || 'USD',
    discountTiers: parseDiscountTiers(map.get('discount_tiers')),
    contactEmail: map.get('contact_email') || '',
  };
}

function parseDiscountTiers(raw?: string): DiscountTier[] {
  if (!raw) return DEFAULT_SETTINGS.discountTiers;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((t: { minItems?: number; percent?: number }) =>
        makeTier(t.minItems ?? 1, t.percent ?? 0),
      );
    }
    return DEFAULT_SETTINGS.discountTiers;
  } catch {
    return DEFAULT_SETTINGS.discountTiers;
  }
}

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: rows = [], isLoading } = useQuery<SettingRow[]>({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  const [form, setForm] = useState<SettingsForm>(DEFAULT_SETTINGS);
  const [savedOnce, setSavedOnce] = useState(false);

  useEffect(() => {
    if (rows.length > 0) {
      setForm(parseSettings(rows));
    }
  }, [rows]);

  const saveMutation = useMutation({
    mutationFn: async (settings: SettingsForm) => {
      const payload = [
        { key: 'shop_open', value: String(settings.shopOpen) },
        { key: 'currency', value: settings.currency },
        {
          key: 'discount_tiers',
          value: JSON.stringify(
            settings.discountTiers.map(({ minItems, percent }) => ({ minItems, percent })),
          ),
        },
        { key: 'contact_email', value: settings.contactEmail },
      ];
      const res = await fetch(`${API_BASE}/api/admin/settings/batch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Save failed (${res.status})`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      setSavedOnce(true);
      setTimeout(() => setSavedOnce(false), 2000);
    },
  });

  const handleSave = useCallback(() => {
    saveMutation.mutate(form);
  }, [form, saveMutation]);

  const updateField = useCallback(
    <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateTier = useCallback((index: number, field: keyof DiscountTier, value: number) => {
    setForm((prev) => {
      const tiers = [...prev.discountTiers];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...prev, discountTiers: tiers };
    });
  }, []);

  const addTier = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      discountTiers: [...prev.discountTiers, makeTier(1, 0)],
    }));
  }, []);

  const removeTier = useCallback((tierId: number) => {
    setForm((prev) => ({
      ...prev,
      discountTiers: prev.discountTiers.filter((t) => t._id !== tierId),
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <IconLoader2 className="h-8 w-8 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Commerce Settings</h1>
        <p className="mt-1 text-sm text-ink/60">
          Manage your shop status, pricing, and contact information.
        </p>
      </div>

      {/* Shop Status */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Status</CardTitle>
          <CardDescription>Control whether customers can place orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="shop-toggle" className="text-base">
              {form.shopOpen ? 'Shop is open' : 'Shop is closed'}
            </Label>
            <button
              id="shop-toggle"
              type="button"
              role="switch"
              aria-checked={form.shopOpen}
              onClick={() => updateField('shopOpen', !form.shopOpen)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-botanical focus-visible:ring-offset-2 ${
                form.shopOpen ? 'bg-botanical' : 'bg-ink/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                  form.shopOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>The currency used for all product pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-[200px]">
            <Label htmlFor="currency" className="mb-1.5">
              Currency Code (ISO 4217)
            </Label>
            <Input
              id="currency"
              value={form.currency}
              onChange={(e) => updateField('currency', e.target.value.toUpperCase().slice(0, 3))}
              placeholder="USD"
              maxLength={3}
              className="uppercase"
            />
          </div>
        </CardContent>
      </Card>

      {/* Discount Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Tiers</CardTitle>
          <CardDescription>
            Volume discounts applied automatically based on cart quantity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {form.discountTiers.map((tier, tierIndex) => (
              <div key={tier._id} className="flex items-end gap-3">
                <div className="flex-1">
                  <Label className="mb-1.5">
                    {tierIndex === 0 ? 'Min items' : `Tier ${tierIndex + 1} min`}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={tier.minItems}
                    onChange={(e) => updateTier(tierIndex, 'minItems', Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-1.5">Discount %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={tier.percent}
                    onChange={(e) => updateTier(tierIndex, 'percent', Number(e.target.value))}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTier(tier._id)}
                  disabled={form.discountTiers.length <= 1}
                  aria-label={`Remove tier ${tierIndex + 1}`}
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addTier} className="gap-1.5">
              <IconPlus size={14} />
              Add tier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Email address for order notifications and customer inquiries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <Label htmlFor="contact-email" className="mb-1.5">
              Contact Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-1.5">
          {saveMutation.isPending ? (
            <>
              <IconLoader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            'Save settings'
          )}
        </Button>
        {savedOnce && !saveMutation.isPending && (
          <span className="flex items-center gap-1 text-sm text-botanical">
            <IconCheck size={14} />
            Saved
          </span>
        )}
        {saveMutation.isError && (
          <span className="text-sm text-red-600">
            {saveMutation.error instanceof Error ? saveMutation.error.message : 'Failed to save'}
          </span>
        )}
      </div>
    </div>
  );
}
