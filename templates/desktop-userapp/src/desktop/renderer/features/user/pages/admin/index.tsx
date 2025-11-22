import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@voilajsx/uikit/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription, AlertTitle } from '@voilajsx/uikit/alert';
import { Badge } from '@voilajsx/uikit/badge';
import { Input } from '@voilajsx/uikit/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@voilajsx/uikit/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@voilajsx/uikit/dialog';
import { Users, ArrowLeft, RefreshCw, AlertTriangle, Mail, Phone, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Search, UserPlus } from 'lucide-react';
import { Header, Footer, SEO } from '../../../../shared/components';
import { AuthGuard } from '../../../auth';
import { useAuth } from '../../../auth';
import { hasRole } from '../../../../shared/utils';
import { config } from '../../../auth/config';
import type { User } from '../../types';
import { USER_ROLES } from '../../index';

interface AdminUser extends User {
  tenantId: string | null;
  lastLogin: string | null;
}


const AdminDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Early return to prevent hooks order violation
  if (!user) {
    return null;
  }

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
    confirmationText: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    user: null,
    confirmationText: '',
    isDeleting: false
  });

  // ALL HOOKS MUST BE DECLARED HERE - BEFORE ANY BUSINESS LOGIC

  const fetchUsers = async () => {
    if (!token || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use admin/users endpoint for admins, admin/list for moderators
      const endpoint = hasRole(user, ['admin.tenant', 'admin.org', 'admin.system'])
        ? '/api/user/admin/users'
        : '/api/user/admin/list';

      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
          [config.auth.headers.auth]: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token && hasRole(user, ['moderator.review', 'moderator.approve', 'moderator.manage', 'admin.tenant', 'admin.org', 'admin.system'])) {
      fetchUsers();
    }
  }, [user, token]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Search filter (using debounced term)
      const searchMatch = !debouncedSearchTerm ||
        user.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        `${user.role}.${user.level}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // Role filter
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;

      // Status filter
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return searchMatch && roleMatch && statusMatch;
    });

    return filtered;
  }, [users, debouncedSearchTerm, roleFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + pageSize);

  const canManageUsers = hasRole(user, ['admin.tenant', 'admin.org', 'admin.system']);
  const canViewUsers = hasRole(user, ['moderator.review', 'moderator.approve', 'moderator.manage', 'admin.tenant', 'admin.org', 'admin.system']);

  // Action handlers
  const handleViewUser = (targetUser: AdminUser) => {
    navigate(`/user/admin/show?id=${targetUser.id}`);
  };

  const handleEditUser = (targetUser: AdminUser) => {
    navigate(`/user/admin/edit?id=${targetUser.id}`);
  };

  const handleDeleteUser = (targetUser: AdminUser) => {
    setDeleteModal({
      isOpen: true,
      user: targetUser,
      confirmationText: '',
      isDeleting: false
    });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal.user || !token) return;

    const expectedText = deleteModal.user.name || deleteModal.user.email;
    if (deleteModal.confirmationText !== expectedText) {
      return; // Don't proceed if confirmation text doesn't match
    }

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`${config.api.baseUrl}/api/user/admin/users/${deleteModal.user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
          [config.auth.headers.auth]: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Remove user from local state
      setUsers(prev => prev.filter(u => u.id !== deleteModal.user!.id));

      // Close modal
      setDeleteModal({
        isOpen: false,
        user: null,
        confirmationText: '',
        isDeleting: false
      });

      // Optionally refresh the users list
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      user: null,
      confirmationText: '',
      isDeleting: false
    });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <PageLayout>
      <SEO
        title="User Admin"
        description="User administration and management dashboard"
      />
      <Header />
      <PageLayout.Content>
        <AuthGuard requiredRoles={USER_ROLES.MODERATOR_ACCESS}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Admin
              </h1>
              <p className="text-muted-foreground">
                User management and system administration. Your role:{' '}
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}.{user.level}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {canManageUsers && (
                <Button onClick={() => navigate('/user/admin/create')} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create User
                </Button>
              )}
              {canViewUsers && (
                <Button onClick={fetchUsers} disabled={isLoading} variant="outline" className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>


          {/* Users List with Working Features */}
          {canViewUsers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({filteredAndSortedUsers.length})
                </CardTitle>
                <CardDescription>
                  {canManageUsers ? 'Manage all user accounts, roles, and permissions' : 'View user listings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="bg-destructive/10 border-destructive text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Users</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search users by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
                  </span>
                  {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setRoleFilter('all');
                        setStatusFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading users...</span>
                  </div>
                ) : paginatedUsers.length > 0 ? (
                  <>
                    {/* Table */}
                    <div className="rounded-md border border-gray-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-200">
                            <TableHead className="border-r border-gray-200">User</TableHead>
                            <TableHead className="border-r border-gray-200">Contact</TableHead>
                            <TableHead className="border-r border-gray-200">Role</TableHead>
                            <TableHead className="border-r border-gray-200">Status</TableHead>
                            <TableHead className="border-r border-gray-200">Last Login</TableHead>
                            <TableHead className="border-r border-gray-200">Created</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((targetUser) => (
                            <TableRow key={targetUser.id} className="hover:bg-muted/50 border-b border-gray-200">
                              <TableCell className="border-r border-gray-200">
                                <div>
                                  <div className="font-medium">{targetUser.name || 'No name'}</div>
                                  <div className="text-sm text-muted-foreground">ID: {targetUser.id}</div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {targetUser.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                {targetUser.phone ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {targetUser.phone}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">No phone</span>
                                )}
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                <Badge variant="secondary">
                                  {targetUser.role}.{targetUser.level}
                                </Badge>
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                <div className="space-y-1">
                                  <Badge variant={targetUser.isActive ? "default" : "destructive"}>
                                    {targetUser.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {targetUser.isVerified && (
                                    <Badge variant="outline" className="text-xs block">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                <span className="text-sm text-muted-foreground">
                                  {targetUser.lastLogin
                                    ? new Date(targetUser.lastLogin).toLocaleDateString()
                                    : 'Never'
                                  }
                                </span>
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(targetUser.createdAt).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewUser(targetUser)}
                                    className="h-8 w-8 p-0"
                                    title="View Profile"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {canManageUsers && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditUser(targetUser)}
                                        className="h-8 w-8 p-0"
                                        title="Edit User"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      {(targetUser.role !== 'admin' || targetUser.level !== 'system') && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteUser(targetUser)}
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                          title="Delete User"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Working Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>

                          {/* Page numbers */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page =>
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              )
                              .map((page, index, array) => (
                                <React.Fragment key={page}>
                                  {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="px-2">...</span>
                                  )}
                                  <Button
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(page)}
                                    className="h-8 w-8 p-0"
                                  >
                                    {page}
                                  </Button>
                                </React.Fragment>
                              ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="text-lg font-medium mb-2">No users found</div>
                    <div className="text-muted-foreground mb-4">
                      {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'There are no users to display at the moment.'
                      }
                    </div>
                    {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setRoleFilter('all');
                          setStatusFilter('all');
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Back to Profile */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={() => navigate('/user')} variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
            </CardContent>
          </Card>
          </div>
        </AuthGuard>
      </PageLayout.Content>

      <Footer />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove all associated data.
            </DialogDescription>
          </DialogHeader>

          {deleteModal.user && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">{deleteModal.user.name || 'No name'}</div>
                <div className="text-sm text-muted-foreground">{deleteModal.user.email}</div>
                <div className="text-sm text-muted-foreground">
                  Role: {deleteModal.user.role}.{deleteModal.user.level}
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="">
<label className="text-sm font-medium ">
                  To confirm deletion, type <span className="font-mono bg-muted px-1 rounded">
                    {deleteModal.user.name || deleteModal.user.email}
                  </span> below:
                </label>
                </div>
                
                <Input
                  value={deleteModal.confirmationText}
                  onChange={(e) => setDeleteModal(prev => ({ ...prev, confirmationText: e.target.value }))}
                  placeholder={deleteModal.user.name || deleteModal.user.email}
                  disabled={deleteModal.isDeleting}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={deleteModal.isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={
                deleteModal.isDeleting ||
                !deleteModal.user ||
                deleteModal.confirmationText !== (deleteModal.user.name || deleteModal.user.email)
              }
              className="gap-2"
            >
              {deleteModal.isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
         
    </PageLayout>
  );
};

export default AdminDashboardPage;