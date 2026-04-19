import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bloomneo/uikit';
import { Edit, ArrowLeft, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { SEO } from '../../../../shared/components';
import { AdminPageHeader } from '../../../admin/components/AdminPageHeader';
import { useAuth } from '../../../auth';
import { route, hasRole } from '../../../../shared/utils';
import { config } from '../../../auth/config';

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  level: string;
  tenantId: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

const EditUserPage: React.FC = () => {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    level: 'basic',
    isActive: true,
    isVerified: false
  });

  // Get values AFTER hooks are declared
  const userId = searchParams.get('id');
  const canManageUsers = user ? hasRole(user, ['admin.tenant', 'admin.org', 'admin.system']) : false;

  const fetchUser = async () => {
    if (!userId || !token) return;

    setIsLoadingUser(true);
    setError(null);

    try {
      const response = await fetch(`${config.api.baseUrl}/api/user/admin/users/${userId}`, {
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
      setUserData(data.user);

      // Set form data from user data
      setFormData({
        name: data.user.name || '',
        email: data.user.email,
        phone: data.user.phone || '',
        role: data.user.role,
        level: data.user.level,
        isActive: data.user.isActive,
        isVerified: data.user.isVerified
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user');
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    if (userId && token && user) {
      fetchUser();
    }
  }, [userId, token, user]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Reset level when role changes and set appropriate default
      if (field === 'role') {
        switch (value) {
          case 'user':
            updated.level = 'basic';
            break;
          case 'moderator':
            updated.level = 'review';
            break;
          case 'admin':
            updated.level = 'tenant';
            break;
          default:
            updated.level = 'basic';
        }
      }

      return updated;
    });
    setError(null);
    setSuccess(null);
  };

  // Get available levels based on selected role
  const getAvailableLevels = (role: string) => {
    if (!user) return [{ value: 'basic', label: 'Basic' }];

    switch (role) {
      case 'user':
        return [
          { value: 'basic', label: 'Basic' },
          { value: 'pro', label: 'Pro' },
          { value: 'max', label: 'Max' }
        ];
      case 'moderator':
        return [
          { value: 'review', label: 'Review' },
          { value: 'approve', label: 'Approve' },
          { value: 'manage', label: 'Manage' }
        ];
      case 'admin':
        const adminLevels = [
          { value: 'tenant', label: 'Tenant' }
        ];
        if (hasRole(user, ['admin.org', 'admin.system'])) {
          adminLevels.push({ value: 'org', label: 'Organization' });
        }
        if (hasRole(user, ['admin.system'])) {
          adminLevels.push({ value: 'system', label: 'System' });
        }
        return adminLevels;
      default:
        return [{ value: 'basic', label: 'Basic' }];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !token) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${config.api.baseUrl}/api/user/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
          [config.auth.headers.auth]: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess('User updated successfully!');
      setUserData(data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  // NOW we can handle conditional rendering using JSX instead of early returns
  if (!user) {
    return null;
  }

  if (!canManageUsers) {
    return (
      <>
    <AdminPageHeader breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/user/admin" },
            { label: "Edit" },
          ]} />
        <SEO title="Access Denied" description="You don't have permission to access this page" />
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                  <p className="text-muted-foreground mb-4">
                    You don't have permission to edit users.
                  </p>
                  <Button asChild>
                    <a href={route('/user/admin')}>Back to User Admin</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
    );
  }

  if (!userId) {
    return (
      <>
    <AdminPageHeader breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/user/admin" },
            { label: "Edit" },
          ]} />
        <SEO title="User Not Found" description="User ID is required" />
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-lg font-semibold mb-2">User Not Found</h2>
                  <p className="text-muted-foreground mb-4">
                    User ID is required to edit a user.
                  </p>
                  <Button asChild>
                    <a href={route('/user/admin')}>Back to User Admin</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
    );
  }

  if (isLoadingUser) {
    return (
      <>
    <AdminPageHeader breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/user/admin" },
            { label: "Edit" },
          ]} />
        <SEO title="Loading User" description="Loading user data..." />
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading user data...</p>
            </div>
          </div>
        </>
    );
  }

  if (error && !userData) {
    return (
      <>
    <AdminPageHeader breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/user/admin" },
            { label: "Edit" },
          ]} />
        <SEO title="Error" description="Failed to load user data" />
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-lg font-semibold mb-2">Error Loading User</h2>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={fetchUser}>Retry</Button>
                    <Button variant="outline" asChild>
                      <a href={route('/user/admin')}>Back to User Admin</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Edit User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/user/admin' },
          { label: 'Edit' },
        ]}
      />
      <SEO
        title={`Edit User - ${userData?.name || userData?.email || 'Unknown'}`}
        description="Edit user account details"
      />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Editing: {userData?.name || userData?.email} (ID: {userData?.id}). Your role:{' '}
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}.{user.level}
                </span>
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a href={route('/user/admin')}>
                <ArrowLeft className="h-4 w-4" />
                Back to User Admin
              </a>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                User Details
              </CardTitle>
              <CardDescription>
                Update the user account information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-6 bg-destructive/10 border-destructive text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">Role</label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        {hasRole(user, ['admin.org', 'admin.system']) && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="level" className="text-sm font-medium">Level</label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableLevels(formData.role).map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onValueChange={(value) => handleInputChange('isActive', value === 'active')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="verified" className="text-sm font-medium">Verification Status</label>
                    <Select
                      value={formData.isVerified ? 'verified' : 'unverified'}
                      onValueChange={(value) => handleInputChange('isVerified', value === 'verified')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    <Edit className="h-4 w-4" />
                    {isLoading ? 'Updating User...' : 'Update User'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href={route('/user/admin')}>Cancel</a>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
  );
};

export default EditUserPage;