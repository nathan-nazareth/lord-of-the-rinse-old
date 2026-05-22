/// <reference types="vite/client" />

import { IconPlus, IconEdit, IconLoader2, IconArchive, IconArchiveOff } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AttributeType, CatalogAttribute } from '@lotr/shared';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Route = createFileRoute('/admin/attributes')({
  component: AdminAttributes,
});

const ATTRIBUTE_TYPES: AttributeType[] = ['shape', 'scent', 'color', 'size', 'addon'];

const TYPE_LABELS: Record<AttributeType, string> = {
  shape: 'Shape',
  scent: 'Scent',
  color: 'Color',
  size: 'Size',
  addon: 'Addon',
};

interface CreateFormData {
  type: AttributeType;
  name: string;
  slug: string;
  displayOrder: number;
}

interface EditFormData {
  name: string;
  slug: string;
  displayOrder: number;
}

const emptyCreateForm: CreateFormData = {
  type: 'scent',
  name: '',
  slug: '',
  displayOrder: 0,
};

async function fetchAttributes(
  includeArchived = false,
  typeFilter?: AttributeType,
): Promise<CatalogAttribute[]> {
  const params = new URLSearchParams();
  if (includeArchived) params.set('includeArchived', 'true');
  if (typeFilter) params.set('type', typeFilter);

  const res = await fetch(`${API_BASE}/api/admin/attributes?${params}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch attributes');
  const data = await res.json();
  return data.attributes;
}

async function createAttribute(data: CreateFormData): Promise<CatalogAttribute> {
  const res = await fetch(`${API_BASE}/api/admin/attributes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to create attribute');
  }
  const body = await res.json();
  return body.attribute;
}

async function updateAttribute(
  id: string,
  data: Partial<EditFormData & { archived: boolean }>,
): Promise<CatalogAttribute> {
  const res = await fetch(`${API_BASE}/api/admin/attributes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to update attribute');
  }
  const body = await res.json();
  return body.attribute;
}

async function archiveAttribute(id: string): Promise<CatalogAttribute> {
  const res = await fetch(`${API_BASE}/api/admin/attributes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to archive attribute');
  }
  const body = await res.json();
  return body.attribute;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function AdminAttributes() {
  const queryClient = useQueryClient();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [typeFilter, setTypeFilter] = useState<AttributeType | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>(emptyCreateForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({ name: '', slug: '', displayOrder: 0 });
  const [error, setError] = useState<string | null>(null);

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['admin-attributes', includeArchived, typeFilter],
    queryFn: () => fetchAttributes(includeArchived, typeFilter || undefined),
  });

  const createMutation = useMutation({
    mutationFn: createAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
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
    }) => updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
      setEditingId(null);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
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

  const startEdit = (attr: CatalogAttribute) => {
    setEditingId(attr.id);
    setEditForm({ name: attr.name, slug: attr.slug, displayOrder: attr.displayOrder });
    setError(null);
  };

  const handleNameChange = (value: string, mode: 'create' | 'edit') => {
    if (mode === 'create') {
      setCreateForm((prev) => ({ ...prev, name: value, slug: slugify(value) }));
    } else {
      setEditForm((prev) => ({ ...prev, name: value, slug: slugify(value) }));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Catalog Attributes</h1>
          <p className="mt-1 text-sm text-ink/60">
            Manage shape, scent, color, size, and addon options.
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
          Add Attribute
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex items-center gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AttributeType | '')}
          className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm text-ink"
        >
          <option value="">All types</option>
          {ATTRIBUTE_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
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
            <CardTitle>New Attribute</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit} className="flex flex-wrap items-end gap-4">
              <div className="w-32">
                <label htmlFor="create-type" className="mb-1 block text-xs font-medium text-ink/70">
                  Type
                </label>
                <select
                  id="create-type"
                  value={createForm.type}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, type: e.target.value as AttributeType }))
                  }
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                >
                  {ATTRIBUTE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <label htmlFor="create-name" className="mb-1 block text-xs font-medium text-ink/70">
                  Name
                </label>
                <input
                  id="create-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => handleNameChange(e.target.value, 'create')}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                  placeholder="e.g. Lavender"
                  required
                />
              </div>
              <div className="w-40">
                <label htmlFor="create-slug" className="mb-1 block text-xs font-medium text-ink/70">
                  Slug
                </label>
                <input
                  id="create-slug"
                  type="text"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                  placeholder="lavender"
                  required
                />
              </div>
              <div className="w-24">
                <label
                  htmlFor="create-order"
                  className="mb-1 block text-xs font-medium text-ink/70"
                >
                  Order
                </label>
                <input
                  id="create-order"
                  type="number"
                  value={createForm.displayOrder}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                  min={0}
                />
              </div>
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
            <CardTitle>Edit Attribute</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditSubmit} className="flex flex-wrap items-end gap-4">
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
              <div className="w-24">
                <label htmlFor="edit-order" className="mb-1 block text-xs font-medium text-ink/70">
                  Order
                </label>
                <input
                  id="edit-order"
                  type="number"
                  value={editForm.displayOrder}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
                  min={0}
                />
              </div>
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

      {/* Attributes Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-ink/50">
          <IconLoader2 size={24} className="animate-spin" />
        </div>
      ) : attributes.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-ink/50">No attributes found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wider text-ink/50">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attributes.map((attr) => (
                  <tr
                    key={attr.id}
                    className={`border-b border-ink/5 transition-colors hover:bg-botanical/5 ${attr.archived ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-botanical/10 px-2.5 py-0.5 text-xs font-medium capitalize text-botanical">
                        {attr.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{attr.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/60">{attr.slug}</td>
                    <td className="px-4 py-3 text-ink/60">{attr.displayOrder}</td>
                    <td className="px-4 py-3">
                      {attr.archived ? (
                        <span className="inline-block rounded-full bg-dusty/20 px-2.5 py-0.5 text-xs text-dusty">
                          Archived
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
                          onClick={() => startEdit(attr)}
                          title="Edit"
                        >
                          <IconEdit size={14} />
                        </Button>
                        {attr.archived ? (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              updateMutation.mutate({ id: attr.id, data: { archived: false } })
                            }
                            title="Unarchive"
                          >
                            <IconArchiveOff size={14} />
                          </Button>
                        ) : (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => archiveMutation.mutate(attr.id)}
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
