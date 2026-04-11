import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@bloomneo/uikit/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bloomneo/uikit/card';
import { Button } from '@bloomneo/uikit/button';
import { Badge } from '@bloomneo/uikit/badge';
import { Alert, AlertDescription, AlertTitle } from '@bloomneo/uikit/alert';
import { Input } from '@bloomneo/uikit/input';
import { ArrowLeft, AlertTriangle, RefreshCw, Mail, Phone, Calendar, Shield, User, Edit } from 'lucide-react';
import { Header, Footer, SEO } from '../../../../shared/components';
import { useAuth } from '../../../auth';
import { hasRole } from '../../../../shared/utils';
import { config } from '../../../auth/config';

interface User {
  id: number;
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

const ShowUserPage: React.FC = () => {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Get values AFTER hooks are declared
  const userId = searchParams.get('id');
  const canViewUsers = user ? hasRole(user, ['moderator.review', 'moderator.approve', 'moderator.manage', 'admin.tenant', 'admin.org', 'admin.system']) : false;
  const canManageUsers = user ? hasRole(user, ['admin.tenant', 'admin.org', 'admin.system']) : false;

  const fetchUser = async () => {
    if (!userId || !token) return;

    setIsLoading(true);
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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user');
    } finally {
      setIsLoading(false);
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
        newPassword = userData?.phone || '';
        break;
    }
    setPasswordData({ newPassword });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const response = await fetch(`${config.api.baseUrl}/api/user/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
          [config.auth.headers.auth]: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      setPasswordSuccess('Password updated successfully!');
      setPasswordData({ newPassword: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token && user) {
      fetchUser();
    }
  }, [userId, token, user]);

  // NOW we can handle conditional rendering using JSX instead of early returns
  if (!user) {
    return null;
  }

  if (!canViewUsers) {
    return (
      <PageLayout>
        <SEO title="Access Denied" description="You don't have permission to access this page" />
        <Header />
        <PageLayout.Content>
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                  <p className="text-muted-foreground mb-4">
                    You don't have permission to view user details.
                  </p>
                  <Button onClick={() => navigate('/user/admin')}>
                    Back to User Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  if (!userId) {
    return (
      <PageLayout>
        <SEO title="User Not Found" description="User ID is required" />
        <Header />
        <PageLayout.Content>
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-lg font-semibold mb-2">User Not Found</h2>
                  <p className="text-muted-foreground mb-4">
                    User ID is required to view user details.
                  </p>
                  <Button onClick={() => navigate('/user/admin')}>
                    Back to User Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <SEO title="Loading User" description="Loading user data..." />
        <Header />
        <PageLayout.Content>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading user data...</p>
            </div>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  if (error || !userData) {
    return (
      <PageLayout>
        <SEO title="Error" description="Failed to load user data" />
        <Header />
        <PageLayout.Content>
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-lg font-semibold mb-2">Error Loading User</h2>
                  <p className="text-muted-foreground mb-4">{error || 'User not found'}</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={fetchUser}>Retry</Button>
                    <Button variant="outline" onClick={() => navigate('/user/admin')}>
                      Back to User Admin
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={`View User - ${userData.name || userData.email}`}
        description="View user account details"
      />
      <Header />

      <PageLayout.Content>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Details
              </h1>
              <p className="text-muted-foreground">
                Viewing: {userData.name || userData.email} (ID: {userData.id}). Your role:{' '}
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}.{user.level}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {canManageUsers && (userData.role !== 'admin' || userData.level !== 'system') && (
                <Button onClick={() => navigate(`/user/admin/edit?id=${userData.id}`)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit User
                </Button>
              )}
              <Button onClick={() => navigate('/user/admin')} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to User Admin
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  User account details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm font-medium">{userData.name || 'No name provided'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{userData.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    {userData.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{userData.phone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No phone number provided</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm font-mono">{userData.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role & Status
                </CardTitle>
                <CardDescription>
                  User permissions and account status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role & Level</label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-sm">
                        {userData.role}.{userData.level}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                    <div className="mt-1">
                      <Badge variant={userData.isActive ? "default" : "destructive"}>
                        {userData.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Verification</label>
                    <div className="mt-1">
                      <Badge variant={userData.isVerified ? "default" : "secondary"}>
                        {userData.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>

                  {userData.tenantId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tenant ID</label>
                      <p className="text-sm font-mono">{userData.tenantId}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity Information
                </CardTitle>
                <CardDescription>
                  User activity and timestamps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                    <p className="text-sm">
                      {userData.lastLogin
                        ? new Date(userData.lastLogin).toLocaleString()
                        : 'Never logged in'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                    <p className="text-sm">
                      {new Date(userData.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm">
                      {new Date(userData.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          {canManageUsers && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Administrative actions for this user.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {(userData.role !== 'admin' || userData.level !== 'system') && (
                    <>
                      <Button onClick={() => navigate(`/user/admin/edit?id=${userData.id}`)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit User
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={fetchUser} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password Change Form */}
          {showPasswordForm && canManageUsers && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Set a new password for {userData?.name || userData?.email}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {passwordError && (
                  <Alert className="mb-4 bg-destructive/10 border-destructive text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                    <RefreshCw className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{passwordSuccess}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                    <Input
                      id="newPassword"
                      type="text"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ newPassword: e.target.value })}
                      placeholder="Enter new password or use options below"
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
                        disabled={!userData?.phone || userData.phone.length < 6}
                      >
                        Phone Number
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default ShowUserPage;