/**
 * /admin — the dashboard home.
 * @file src/web/features/admin/pages/index.tsx
 *
 * Renders the widgets listed in `ADMIN_DASHBOARD_WIDGETS` (env var,
 * default `users,signups,activity`). Every widget reads from a single
 * endpoint — `GET /api/admin/summary` — so the page makes one network
 * call on load, not N.
 *
 * TODO: To add a widget:
 *   1. Add the data field to `AdminSummary` in admin.service.ts on the API
 *   2. Extend `admin.service.ts::getSummary` to populate it
 *   3. Add a `WidgetXxx` render function below + a case in renderWidget
 *   4. Add the widget's key to your `ADMIN_DASHBOARD_WIDGETS` env var
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bloomneo/uikit';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { adminFetchJson } from '../lib/admin-api';

/**
 * Matches the server-side `AdminSummary` shape. Kept inline so this page
 * doesn't have to import from the API feature (which would cross the
 * api/web boundary). If the shape changes on the server, update here too.
 *
 * TODO: Consider extracting to a shared types package if you add more
 * endpoints — but premature abstraction for one consumer.
 */
interface AdminSummary {
  users: {
    total: number;
    byRole: Array<{ role: string; level: string; count: number }>;
  };
  signups: {
    last30d: number;
    daily: Array<{ day: string; count: number }>;
  };
  activity: {
    recent: Array<{
      id: string;
      actorId: string | null;
      action: string;
      entityType: string | null;
      createdAt: string;
    }>;
  };
}

/**
 * Read ADMIN_DASHBOARD_WIDGETS at module scope (Vite inlines the env
 * var at build time, so this is effectively a constant). Falls back to
 * the default set so a freshly scaffolded app shows everything.
 */
const WIDGETS: string[] = (
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_ADMIN_DASHBOARD_WIDGETS ?? 'users,signups,activity'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export default function AdminDashboard() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminFetchJson<AdminSummary>('/api/admin/summary')
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]}
      />
      {error && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Failed to load dashboard: {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {WIDGETS.map((key) => renderWidget(key, summary))}
      </div>
    </>
  );
}

function renderWidget(key: string, summary: AdminSummary | null) {
  switch (key) {
    case 'users':
      return <WidgetUsers key={key} summary={summary} />;
    case 'signups':
      return <WidgetSignups key={key} summary={summary} />;
    case 'activity':
      return <WidgetActivity key={key} summary={summary} />;
    // TODO: new widgets register here.
    default:
      return null;
  }
}

function WidgetUsers({ summary }: { summary: AdminSummary | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Active users
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!summary ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <>
            <div className="text-3xl font-bold">{summary.users.total}</div>
            {summary.users.byRole.length > 0 && (
              <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                {summary.users.byRole.map((r) => (
                  <li key={`${r.role}.${r.level}`}>
                    {r.role}.{r.level}: {r.count}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WidgetSignups({ summary }: { summary: AdminSummary | null }) {
  const peakLabel = useMemo(() => {
    if (!summary) return null;
    const peak = summary.signups.daily.reduce(
      (best, d) => (d.count > best.count ? d : best),
      { day: '', count: -1 },
    );
    return peak.count > 0 ? `${peak.count} on ${peak.day}` : 'no peak yet';
  }, [summary]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Signups (30d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!summary ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <>
            <div className="text-3xl font-bold">{summary.signups.last30d}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Peak: {peakLabel}
            </p>
            {/* TODO: Plug a tiny sparkline here. uikit doesn't ship a
                chart primitive yet; once recharts is added as an optional
                peer dep, render `summary.signups.daily` as an area series. */}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WidgetActivity({ summary }: { summary: AdminSummary | null }) {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!summary ? (
          <Skeleton className="h-24 w-full" />
        ) : summary.activity.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.activity.recent.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">
                    {row.action}
                  </TableCell>
                  <TableCell>{row.actorId ?? 'system'}</TableCell>
                  <TableCell>{row.entityType ?? '—'}</TableCell>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
