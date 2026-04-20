/**
 * /user/admin — user list + role/status management.
 * @file src/web/features/user/pages/admin/index.tsx
 *
 * Built on uikit's <DataTable> so search, role/status filters,
 * pagination, and sorting are declarative. We only supply the
 * columns + the row-action handlers + the data.
 *
 * Delete flow uses `useConfirm.destructive` — the user has to type
 * the account name/email before the destructive button enables, so
 * accidental deletes aren't possible.
 *
 * TODO: Move the data fetch to a useQuery hook once uikit ships one;
 * right now it's a plain useEffect + setState. Swap when ready.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  DataTable,
  useConfirm,
  type DataTableColumn,
  type RowAction,
} from '@bloomneo/uikit';
import { Eye, Edit, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../shared/components';
import { useAuth } from '../../../auth';
import { hasRole, route } from '../../../../shared/utils';
import { config } from '../../../auth/config';
import { AdminPageHeader } from '../../../admin/components/AdminPageHeader';
import type { User } from '../../types';

interface AdminUser extends User {
  tenantId: string | null;
  lastLogin: string | null;
}

export default function AdminUsersPage() {
  const { user, token } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageUsers = user !== null && hasRole(user, ['admin.system']);
  const canViewUsers =
    user !== null && hasRole(user, ['moderator.manage', 'admin.system']);

  const fetchUsers = useCallback(async () => {
    if (!token || !user) return;
    setIsLoading(true);
    setError(null);
    try {
      // Admins get the full CRUD list; moderators get the read-only list.
      const endpoint = canManageUsers
        ? '/api/user/admin/users'
        : '/api/user/admin/list';
      const res = await fetch(`${config.api.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]:
            config.auth.headers.frontendKeyValue,
          [config.auth.headers.auth]: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [token, user, canManageUsers]);

  useEffect(() => {
    if (canViewUsers) fetchUsers();
  }, [canViewUsers, fetchUsers]);

  const handleDelete = useCallback(
    async (target: AdminUser) => {
      const verify = target.name || target.email;
      const ok = await confirm.destructive({
        title: 'Delete user',
        description:
          'This permanently deletes the account and its data. Type the user name or email below to confirm.',
        verifyText: verify,
      });
      if (!ok) return;
      try {
        const res = await fetch(
          `${config.api.baseUrl}/api/user/admin/users/${target.id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              [config.auth.headers.frontendKey]:
                config.auth.headers.frontendKeyValue,
              [config.auth.headers.auth]: `Bearer ${token}`,
            },
          },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? `HTTP ${res.status}`);
        }
        setUsers((prev) => prev.filter((u) => u.id !== target.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    },
    [confirm, token],
  );

  /**
   * Columns. Rules:
   *   - Every column has an `accessor` (not `accessorKey`) that returns
   *     the canonical searchable/sortable value. Using an accessor gives
   *     us a single place to coerce null → '' so search doesn't match
   *     the literal string "null", and sort doesn't blow up.
   *   - `sortable: true` per column + matching `dataType` hint so the
   *     built-in comparator picks string / number / date semantics.
   *   - `cell` is the display renderer; it never affects search or sort.
   */
  const columns = useMemo<DataTableColumn<AdminUser>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessor: (row) => row.name ?? '',
        sortable: true,
        dataType: 'string',
        // Click the name → jump to the show page. Falls back to a dash
        // when the user has no name set yet. react-router's <Link> keeps
        // this an in-app navigation (no full-page reload).
        cell: (_, row) =>
          row.name ? (
            <Link
              to={route(`/user/admin/show?id=${row.id}`)}
              className="font-medium text-primary hover:underline"
            >
              {row.name}
            </Link>
          ) : (
            <Link
              to={route(`/user/admin/show?id=${row.id}`)}
              className="text-muted-foreground hover:underline"
            >
              —
            </Link>
          ),
      },
      {
        id: 'email',
        header: 'Email',
        accessor: (row) => row.email ?? '',
        sortable: true,
        dataType: 'string',
      },
      {
        id: 'role',
        header: 'Role',
        accessor: (row) => `${row.role}.${row.level}`,
        sortable: true,
        dataType: 'string',
        cell: (_, row) => (
          <Badge variant="secondary">
            {row.role}.{row.level}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        // Boolean → 'active' / 'inactive' strings so search hits the
        // words a user would actually type, and the default comparator
        // does a string sort instead of stringifying `true`/`false`.
        accessor: (row) => (row.isActive ? 'active' : 'inactive'),
        sortable: true,
        dataType: 'string',
        cell: (_, row) =>
          row.isActive ? (
            <Badge>Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          ),
      },
      {
        id: 'createdAt',
        header: 'Joined',
        accessor: (row) => row.createdAt ?? '',
        sortable: true,
        dataType: 'date',
        cell: (v) =>
          v ? new Date(String(v)).toLocaleDateString() : '',
      },
    ],
    [],
  );

  /**
   * Row actions — shown as a dropdown button per row. `visible` gates
   * a single action; e.g. moderators can View but not Edit/Delete.
   * The server enforces the same rules — this is UX, not security.
   */
  const actions = useMemo<RowAction<AdminUser>[]>(
    () => [
      {
        id: 'view',
        label: 'View',
        icon: Eye,
        onClick: (row) => {
          navigate(route(`/user/admin/show?id=${row.id}`));
        },
      },
      {
        id: 'edit',
        label: 'Edit',
        icon: Edit,
        visible: () => canManageUsers,
        onClick: (row) => {
          navigate(route(`/user/admin/edit?id=${row.id}`));
        },
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        visible: (row) =>
          canManageUsers &&
          // Never allow deleting the system admin from the UI — they're
          // the only user who can recover access for everyone else.
          !(row.role === 'admin' && row.level === 'system'),
        onClick: (row) => {
          void handleDelete(row);
        },
      },
    ],
    [canManageUsers, handleDelete, navigate],
  );

  if (!user) return null;

  return (
    <>
      <AdminPageHeader
        title="Users"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users' },
        ]}
      />
      <SEO
        title="User Admin"
        description="User administration and management dashboard"
      />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Your role:{' '}
          <Badge variant="secondary">
            {user.role}.{user.level}
          </Badge>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
          {canManageUsers && (
            <Button asChild className="gap-2">
              <Link to={route('/user/admin/create')}>
                <UserPlus className="h-4 w-4" />
                Create user
              </Link>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Could not load users</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable<AdminUser>
        // Never pass undefined to data — uikit asserts and throws with
        // a link. Empty-array is the idiomatic loading sentinel.
        data={users ?? []}
        columns={columns}
        actions={actions}
        searchable
        searchPlaceholder="Search name, email, role…"
        pagination
        pageSize={10}
        getRowId={(row) => row.id}
      />
    </>
  );
}
