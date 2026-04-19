import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bloomneo/uikit';
import { UserPlus, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { SEO } from '../../../../shared/components';
import { AdminShell } from '../../../admin/components/AdminShell';
import { useAuth } from '../../../auth';
import { route, hasRole } from '../../../../shared/utils';
import { config } from '../../../auth/config';
import { USER_ROLES } from '../../index';

const CreateUserPage: React.FC = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    level: 'basic',
    isActive: true,
    isVerified: false
  });

  if (!user) {
    return null;
  }

  const canManageUsers = hasRole(user, ['admin.tenant', 'admin.org', 'admin.system']);

  if (!canManageUsers) {
    return (
      <AdminShell
        currentPath="/user/admin"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/user/admin' },
          { label: 'Create' },
        ]}
      >
        <SEO title="Access Denied" description="You don't have permission to access this page" />
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  You don't have permission to create users.
                </p>
                <Button asChild>
                  <a href={route('/user/admin')}>Back to User Admin</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminShell>
    );
  }

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

  // Password generation functions
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const setPasswordOption = (option: 'random' | 'default' | 'phone') => {
    let newPassword = '';
    switch (option) {
      case 'random':
        newPassword = generateRandomPassword();
        break;
      case 'default':
        newPassword = 'default12345';
        break;
      case 'phone':
        newPassword = formData.phone || '';
        break;
    }
    handleInputChange('password', newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate password length
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.api.baseUrl}/api/user/admin/create`, {
        method: 'POST',
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
      setSuccess(`User created successfully! User ID: ${data.user?.id}`);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        level: 'basic',
        isActive: true,
        isVerified: false
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminShell
      currentPath="/user/admin"
      requiredRoles={USER_ROLES.ADMIN_ACCESS}
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Users', href: '/user/admin' },
        { label: 'Create' },
      ]}
    >
      <SEO
        title="Create User"
        description="Create a new user account"
      />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create User
              </h1>
              <p className="text-muted-foreground">
                Add a new user to the system. Your role:{' '}
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
                <UserPlus className="h-5 w-5" />
                User Details
              </CardTitle>
              <CardDescription>
                Enter the information for the new user account.
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
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <div className="space-y-2">
                      <Input
                        id="password"
                        type="text"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter password or use options below"
                        required
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPasswordOption('random')}
                        >
                          Random
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPasswordOption('default')}
                        >
                          Default12345
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPasswordOption('phone')}
                          disabled={!formData.phone || formData.phone.length < 6}
                        >
                          Phone Number
                        </Button>
                      </div>
                    </div>
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
                    <label htmlFor="verification" className="text-sm font-medium">Email Verification</label>
                    <Select
                      value={formData.isVerified ? 'verified' : 'not-verified'}
                      onValueChange={(value) => handleInputChange('isVerified', value === 'verified')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="not-verified">Not Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    {isLoading ? 'Creating User...' : 'Create User'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href={route('/user/admin')}>Cancel</a>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
    </AdminShell>
  );
};

export default CreateUserPage;