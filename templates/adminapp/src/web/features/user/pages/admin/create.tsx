import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bloomneo/uikit';
import { UserPlus, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { SEO } from '../../../../shared/components';
import { AdminPageHeader } from '../../../admin/components/AdminPageHeader';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth';
import { route, hasRole } from '../../../../shared/utils';
import { config } from '../../../auth/config';

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

  const canManageUsers = hasRole(user, ['admin.system']);

  if (!canManageUsers) {
    return (
      <>
    <AdminPageHeader breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/user/admin' },
          { label: 'Create' },
        ]} />
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
                  <Link to={route('/user/admin')}>Back to User Admin</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // One level per role — template ships three tiers total.
      if (field === 'role') {
        updated.level = defaultLevelFor(value as string);
      }

      return updated;
    });
    setError(null);
    setSuccess(null);
  };

  // Three-tier role model: admin.system / moderator.manage / user.basic.
  // Extend `getAvailableLevels` + `defaultLevelFor` together if you add
  // new tiers, and keep them in sync with `admin.roles.ts` + the server-
  // side gates in `api/features/user/user.route.ts`.
  const defaultLevelFor = (role: string): string => {
    switch (role) {
      case 'admin': return 'system';
      case 'moderator': return 'manage';
      case 'user': return 'basic';
      default: return 'basic';
    }
  };

  const getAvailableLevels = (role: string) => {
    switch (role) {
      case 'user':
        return [{ value: 'basic', label: 'Basic' }];
      case 'moderator':
        return [{ value: 'manage', label: 'Manage' }];
      case 'admin':
        return [{ value: 'system', label: 'System' }];
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
    <>
      <AdminPageHeader
        title="Create User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/user/admin' },
          { label: 'Create' },
        ]}
      />
      <SEO
        title="Create User"
        description="Create a new user account"
      />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Add a new user to the system. Your role:{' '}
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}.{user.level}
                </span>
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to={route('/user/admin')}>
                <ArrowLeft className="h-4 w-4" />
                Back to User Admin
              </Link>
            </Button>
          </div>

          {error && (
            <Alert className="bg-destructive/10 border-destructive text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Same split as the edit page: Profile (identity + password)
              on the left, Access (role / level / status / verification)
              on the right. Two equal-width columns on md+, stacks on
              mobile. Full-width inputs inside each card so selects
              don't crunch. */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Profile
                  </CardTitle>
                  <CardDescription>Contact info + initial password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Full name</label>
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
                    <label htmlFor="email" className="text-sm font-medium">Email address</label>
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
                    <label htmlFor="phone" className="text-sm font-medium">Phone number</label>
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
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password or use an option below"
                      required
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button type="button" variant="outline" size="sm" onClick={() => setPasswordOption('random')}>
                        Random
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setPasswordOption('default')}>
                        Default12345
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPasswordOption('phone')}
                        disabled={!formData.phone || formData.phone.length < 6}
                      >
                        Phone number
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access</CardTitle>
                  <CardDescription>Role, level, and account state at creation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">Role</label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        {hasRole(user, ['admin.system']) && (
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
                    <label htmlFor="verification" className="text-sm font-medium">Email verification</label>
                    <Select
                      value={formData.isVerified ? 'verified' : 'not-verified'}
                      onValueChange={(value) => handleInputChange('isVerified', value === 'verified')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="not-verified">Not verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {isLoading ? 'Creating user…' : 'Create user'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={route('/user/admin')}>Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
    </>
  );
};

export default CreateUserPage;