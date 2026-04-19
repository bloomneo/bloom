/**
 * /admin/settings — editable settings list.
 * @file src/web/features/admin/pages/settings.tsx
 *
 * Shows every `AppSetting` row; each row has an inline edit. Saving
 * fires `PUT /api/settings/admin/:key` which upserts + writes an audit
 * event on the server (see settings.service.ts).
 *
 * Settings are grouped visually by key prefix:
 *   - business_*  → "Business"
 *   - support_*   → "Support"
 *   - feature_*   → "Feature flags"
 *   - other       → "Other"
 *
 * TODO: Add an "Is public" toggle per row (the schema supports it, UI
 * doesn't expose it yet). The endpoint would need a PATCH or an expanded
 * PUT body to accept { value, isPublic }.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Skeleton,
  toast,
} from '@bloomneo/uikit';
import { AdminShell } from '../components/AdminShell';
import { adminFetchJson } from '../lib/admin-api';

interface SettingRow {
  key: string;
  value: string;
  isPublic: boolean;
  description: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

const GROUP_FOR_PREFIX: Array<{ prefix: string; label: string }> = [
  { prefix: 'business_', label: 'Business' },
  { prefix: 'support_', label: 'Support' },
  { prefix: 'feature_', label: 'Feature flags' },
];

function groupOf(key: string): string {
  for (const g of GROUP_FOR_PREFIX) {
    if (key.startsWith(g.prefix)) return g.label;
  }
  return 'Other';
}

export default function AdminSettings() {
  const [rows, setRows] = useState<SettingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetchJson<{ items: SettingRow[] }>('/api/settings/admin/list')
      .then((data) => setRows(data.items))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load'),
      );
  }, []);

  // Group by prefix for rendering. Preserves the DB ordering within each
  // group, which keeps the list stable across refreshes.
  const grouped = useMemo(() => {
    if (!rows) return null;
    const out: Record<string, SettingRow[]> = {};
    for (const row of rows) {
      const g = groupOf(row.key);
      (out[g] ??= []).push(row);
    }
    return out;
  }, [rows]);

  async function saveValue(key: string, value: string) {
    try {
      const saved = await adminFetchJson<SettingRow>(
        `/api/settings/admin/${encodeURIComponent(key)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ value }),
        },
      );
      setRows((prev) =>
        prev ? prev.map((r) => (r.key === key ? saved : r)) : prev,
      );
      toast.success(`Saved ${key}`);
    } catch (e) {
      toast.error(
        `Failed to save ${key}: ${e instanceof Error ? e.message : 'unknown error'}`,
      );
    }
  }

  return (
    <AdminShell
      currentPath="/admin/settings"
      title="Settings"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]}
    >
      {error && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Failed to load: {error}
          </CardContent>
        </Card>
      )}

      {!grouped ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, groupRows]) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle>{group}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupRows.map((row) => (
                  <SettingEditor key={row.key} row={row} onSave={saveValue} />
                ))}
              </CardContent>
            </Card>
          ))}
          {Object.keys(grouped).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No settings yet. Seed initial values via
                <code className="mx-1 font-mono">prisma/seeding/settings.seed.js</code>
                or insert rows through the Prisma studio.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function SettingEditor({
  row,
  onSave,
}: {
  row: SettingRow;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(row.value);
  const [saving, setSaving] = useState(false);
  const dirty = draft !== row.value;

  // Keep the draft in sync if the parent list is replaced (e.g. after
  // another save). Without this, a concurrent update would leave the
  // input showing stale state.
  useEffect(() => {
    setDraft(row.value);
  }, [row.value]);

  return (
    <div className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        <code className="font-mono text-xs">{row.key}</code>
        {row.isPublic && (
          <Badge variant="outline" className="text-xs">public</Badge>
        )}
      </div>
      {row.description && (
        <p className="text-xs text-muted-foreground">{row.description}</p>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1"
        />
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(row.key, draft);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
