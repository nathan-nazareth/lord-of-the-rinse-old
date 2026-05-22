/// <reference types="vite/client" />

import { IconPlus, IconEdit, IconLoader2, IconArchive, IconArchiveOff } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VariantAttributeRef, CatalogAttribute, AttributeType } from '@lotr/shared';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Route = createFileRoute('/admin/variants')({
  component: AdminVariants,
});

const TYPE_LABELS: Record<AttributeType, string> = {
  shape: 'Shape',
  scent: 'Scent',
  color: 'Color',
  size: 'Size',
  addon: 'Addon',
};

interface VariantWithAttrs {
  id: string;
  name: string;
  slug: string;
  unitPrice: string;
  enabled: boolean;
  archived: boolean;
  attributes: VariantAttributeRef[];
  createdAt: string;
  updatedAt: string;
}

interface CreateFormData {
  name: string;
  slug: string;
  unitPrice: string;
  attributes: VariantAttributeRef[];
}

interface EditFormData {
  name: string;
  slug: string;
  unitPrice: string;
  enabled: boolean;
  attributes: VariantAttributeRef[];
}

const emptyAttrRef: VariantAttributeRef = { attributeId: '', value: '' };

const emptyCreateForm: CreateFormData = {
  name: '',
  slug: '',
  unitPrice: '',
  attributes: [{ ...emptyAttrRef }],
};

async function fetchVariants(includeArchived = false): Promise<VariantWithAttrs[]> {
  const params = new URLSearchParams();
  if (includeArchived) params.set('includeArchived', 'true');

  const res = await fetch(`${API_BASE}/api/admin/variants?${params}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch variants');
  const data = await res.json();
  return data.variants;
}

async function fetchAttributes(): Promise<CatalogAttribute[]> {
  const res = await fetch(`${API_BASE}/api/admin/attributes?includeArchived=false`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch attributes');
  const data = await res.json();
  return data.attributes;
}

async function createVariant(data: CreateFormData): Promise<VariantWithAttrs> {
  const res = await fetch(`${API_BASE}/api/admin/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to create variant');
  }
  const body = await res.json();
  return body.variant;
}

async function updateVariant(
  id: string,
  data: Partial<EditFormData & { archived: boolean }>,
): Promise<VariantWithAttrs> {
  const res = await fetch(`${API_BASE}/api/admin/variants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to update variant');
  }
  const body = await res.json();
  return body.variant;
}

async function archiveVariant(id: string): Promise<VariantWithAttrs> {
  const res = await fetch(`${API_BASE}/api/admin/variants/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to archive variant');
  }
  const body = await res.json();
  return body.variant;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (Number.isNaN(num)) return price;
  return `$${num.toFixed(2)}`;
}

function AdminVariants() {
  const queryClient = useQueryClient();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>(emptyCreateForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    slug: '',
    unitPrice: '',
    enabled: true,
    attributes: [{ ...emptyAttrRef }],
  });
  const [error, setError] = useState<string | null>(null);

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['admin-variants', includeArchived],
    queryFn: () => fetchVariants(includeArchived),
  });

  const { data: attributes = [] } = useQuery({
    queryKey: ['admin-attributes-for-variants'],
    queryFn: fetchAttributes,
  });

  const createMutation = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
      setCreateForm(emptyCreateForm);
      setShowCreateForm(false);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EditFormData & { archived: boolean }>;
    }) => updateVariant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
      setEditingId(null);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: archiveVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createForm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, data: editForm });
  };

  const startEdit = (variant: VariantWithAttrs) => {
    setEditingId(variant.id);
    setEditForm({
      name: variant.name,
      slug: variant.slug,
      unitPrice: variant.unitPrice,
      enabled: variant.enabled,
      attributes:
        variant.attributes.length > 0
          ? variant.attributes.map((a) => ({ ...a }))
          : [{ ...emptyAttrRef }],
    });
    setError(null);
  };

  const handleNameChange = (value: string, mode: 'create' | 'edit') => {
    if (mode === 'create') {
      setCreateForm((prev) => ({ ...prev, name: value, slug: slugify(value) }));
    } else {
      setEditForm((prev) => ({ ...prev, name: value, slug: slugify(value) }));
    }
  };

  const updateCreateAttr = (index: number, field: 'attributeId' | 'value', value: string) => {
    setCreateForm((prev) => {
      const attrs = [...prev.attributes];
      attrs[index] = { ...attrs[index], [field]: value };
      return { ...prev, attributes: attrs };
    });
  };

  const addCreateAttr = () => {
    setCreateForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { ...emptyAttrRef }],
    }));
  };

  const removeCreateAttr = (index: number) => {
    setCreateForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const updateEditAttr = (index: number, field: 'attributeId' | 'value', value: string) => {
    setEditForm((prev) => {
      const attrs = [...prev.attributes];
      attrs[index] = { ...attrs[index], [field]: value };
      return { ...prev, attributes: attrs };
    });
  };

  const addEditAttr = () => {
    setEditForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { ...emptyAttrRef }],
    }));
  };

  const removeEditAttr = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const getAttributeName = (attributeId: string): string => {
    const attr = attributes.find((a) => a.id === attributeId);
    if (!attr) return 'Unknown';
    return `${TYPE_LABELS[attr.type] || attr.type}: ${attr.name}`;
  };

  const renderAttributeRows = (
    attrs: VariantAttributeRef[],
    _mode: 'create' | 'edit',
    updateAttr: (index: number, field: 'attributeId' | 'value', value: string) => void,
    addAttr: () => void,
    removeAttr: (index: number) => void,
  ) => (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-ink/70">Attributes</span>
      {attrs.map((attr, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form rows may have empty attributeId
          key={`${attr.attributeId || 'new'}-${i}`}
          className="flex items-center gap-2"
        >
          <select
            value={attr.attributeId}
            onChange={(e) => updateAttr(i, 'attributeId', e.target.value)}
            className="flex-1 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
            required
          >
            <option value="">Select attribute...</option>
            {attributes.map((a) => (
              <option key={a.id} value={a.id}>
                {TYPE_LABELS[a.type]}: {a.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={attr.value}
            onChange={(e) => updateAttr(i, 'value', e.target.value)}
            className="w-40 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
            placeholder="Value"
            required
          />
          {attrs.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => removeAttr(i)}
              title="Remove"
            >
              ×
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addAttr}>
        <IconPlus size={14} />
        Add attribute
      </Button>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Soap Variants</h1>
          <p className="mt-1 text-sm text-ink/60">
            Manage product variants with shape, scent, color, size, and addon references.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingId(null);
            setError(null);
          }}
        >
          <IconPlus size={16} />
          Add Variant
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="rounded border-ink/20"
          />
          Show archived
        </label>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-48">
                  <label
                    htmlFor="create-name"
                    className="mb-1 block text-xs font-medium text-ink/70"
                  >
                    Name
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={createForm.name}
                    onChange={(e) => handleNameChange(e.target.value, 'create')}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    placeholder="e.g. Lavender Delight"
                    required
                  />
                </div>
                <div className="w-40">
                  <label
                    htmlFor="create-slug"
                    className="mb-1 block text-xs font-medium text-ink/70"
                  >
                    Slug
                  </label>
                  <input
                    id="create-slug"
                    type="text"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    placeholder="lavender-delight"
                    required
                  />
                </div>
                <div className="w-28">
                  <label
                    htmlFor="create-price"
                    className="mb-1 block text-xs font-medium text-ink/70"
                  >
                    Price
                  </label>
                  <input
                    id="create-price"
                    type="text"
                    value={createForm.unitPrice}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, unitPrice: e.target.value }))
                    }
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    placeholder="9.99"
                    required
                  />
                </div>
              </div>
              {renderAttributeRows(
                createForm.attributes,
                'create',
                updateCreateAttr,
                addCreateAttr,
                removeCreateAttr,
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : null}
                  Create
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
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

      {/* Edit Form */}
      {editingId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-48">
                  <label htmlFor="edit-name" className="mb-1 block text-xs font-medium text-ink/70">
                    Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleNameChange(e.target.value, 'edit')}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    required
                  />
                </div>
                <div className="w-40">
                  <label htmlFor="edit-slug" className="mb-1 block text-xs font-medium text-ink/70">
                    Slug
                  </label>
                  <input
                    id="edit-slug"
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    required
                  />
                </div>
                <div className="w-28">
                  <label
                    htmlFor="edit-price"
                    className="mb-1 block text-xs font-medium text-ink/70"
                  >
                    Price
                  </label>
                  <input
                    id="edit-price"
                    type="text"
                    value={editForm.unitPrice}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, unitPrice: e.target.value }))
                    }
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="edit-enabled" className="text-xs font-medium text-ink/70">
                    Enabled
                  </label>
                  <input
                    id="edit-enabled"
                    type="checkbox"
                    checked={editForm.enabled}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="rounded border-ink/20"
                  />
                </div>
              </div>
              {renderAttributeRows(
                editForm.attributes,
                'edit',
                updateEditAttr,
                addEditAttr,
                removeEditAttr,
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : null}
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
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

      {/* Variants Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-ink/50">
          <IconLoader2 size={24} className="animate-spin" />
        </div>
      ) : variants.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-ink/50">No variants found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wider text-ink/50">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Attributes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr
                    key={variant.id}
                    className={`border-b border-ink/5 transition-colors hover:bg-botanical/5 ${variant.archived ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-ink">{variant.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/60">{variant.slug}</td>
                    <td className="px-4 py-3 text-ink/80">{formatPrice(variant.unitPrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {variant.attributes.map((a) => (
                          <span
                            key={a.attributeId}
                            className="inline-block rounded-full bg-botanical/10 px-2 py-0.5 text-xs text-botanical"
                          >
                            {getAttributeName(a.attributeId)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {variant.archived ? (
                        <span className="inline-block rounded-full bg-dusty/20 px-2.5 py-0.5 text-xs text-dusty">
                          Archived
                        </span>
                      ) : !variant.enabled ? (
                        <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700">
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(variant)}
                          title="Edit"
                        >
                          <IconEdit size={14} />
                        </Button>
                        {!variant.archived && (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              updateMutation.mutate({
                                id: variant.id,
                                data: { enabled: !variant.enabled },
                              })
                            }
                            title={variant.enabled ? 'Disable' : 'Enable'}
                          >
                            {variant.enabled ? '○' : '●'}
                          </Button>
                        )}
                        {variant.archived ? (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              updateMutation.mutate({ id: variant.id, data: { archived: false } })
                            }
                            title="Unarchive"
                          >
                            <IconArchiveOff size={14} />
                          </Button>
                        ) : (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => archiveMutation.mutate(variant.id)}
                            title="Archive"
                          >
                            <IconArchive size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
