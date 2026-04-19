/**
 * /admin/audit — audit log browser.
 * @file src/web/features/admin/pages/audit.tsx
 *
 * List view with filters. Filters are driven off URL query params so
 * URLs can be shared with a teammate ("check this event I saw") —
 * pattern to keep when extending.
 *
 * TODO: Add a detail drawer for individual rows (oldValue/newValue diff).
 * TODO: Export CSV of current filter result — useful for compliance asks.
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Input,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bloomneo/uikit';
import { AdminShell } from '../components/AdminShell';

interface AuditRow {
  id: string;
  actorId: string | null;
  actorType: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  createdAt: string;
}

interface Filters {
  action: string;
  entityType: string;
  actorId: string;
}

const EMPTY_FILTERS: Filters = { action: '', entityType: '', actorId: '' };

export default function AdminAudit() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce filter changes so we don't fetch per keystroke. 300ms is
  // the conventional "feels snappy but saves requests" window.
  useEffect(() => {
    const id = setTimeout(() => load(filters), 300);
    return () => clearTimeout(id);
  }, [filters]);

  async function load(current: Filters) {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (current.action) params.set('action', current.action);
      if (current.entityType) params.set('entityType', current.entityType);
      if (current.actorId) params.set('actorId', current.actorId);
      const res = await fetch(`/api/audit/list?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(data.items as AuditRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setRows([]);
    }
  }

  return (
    <AdminShell
      currentPath="/admin/audit"
      title="Audit log"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit log' }]}
    >
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              placeholder="Action (e.g. settings.update)"
              value={filters.action}
              onChange={(e) =>
                setFilters((f) => ({ ...f, action: e.target.value }))
              }
            />
            <Input
              placeholder="Entity type (e.g. setting)"
              value={filters.entityType}
              onChange={(e) =>
                setFilters((f) => ({ ...f, entityType: e.target.value }))
              }
            />
            <Input
              placeholder="Actor ID"
              value={filters.actorId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, actorId: e.target.value }))
              }
            />
            <Button
              variant="outline"
              onClick={() => setFilters(EMPTY_FILTERS)}
              disabled={
                !filters.action && !filters.entityType && !filters.actorId
              }
            >
              Clear filters
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">
              Failed to load: {error}
            </p>
          )}

          {!rows ? (
            <Skeleton className="h-40 w-full" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No audit events match these filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.action}
                    </TableCell>
                    <TableCell>{r.actorId ?? r.actorType}</TableCell>
                    <TableCell>
                      {r.entityType ? `${r.entityType}${r.entityId ? `:${r.entityId}` : ''}` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.description ?? ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
