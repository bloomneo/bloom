import React from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageLayout } from '@bloomneo/uikit';
import { Users, Shield, Settings, ArrowLeft } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';
import { useAuth } from '../../auth';
import { route, hasRole } from '../../../shared/utils';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const canManageUsers = hasRole(user, ['admin.tenant', 'admin.org', 'admin.system']);
  const canViewUsers = hasRole(user, ['moderator.review', 'moderator.approve', 'moderator.manage', 'admin.tenant', 'admin.org', 'admin.system']);

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
                  <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                  <p className="text-muted-foreground mb-4">
                    You don't have permission to access the admin area.
                  </p>
                  <Button asChild>
                    <a href={route('/dashboard')}>Back to Dashboard</a>
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

  return (
    <PageLayout>
      <SEO
        title="Admin"
        description="Administration dashboard and management tools"
      />
      <Header />

      <PageLayout.Content>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin
              </h1>
              <p className="text-muted-foreground">
                Administration dashboard and management tools. Your role:{' '}
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}.{user.level}
                </span>
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a href={route('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </a>
            </Button>
          </div>

          {/* Admin Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Tools
              </CardTitle>
              <CardDescription>
                Access administrative functions and management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Users Management */}
                <Button asChild className="h-auto flex-col py-6 px-4" variant="outline">
                  <a href={route('/user/admin')}>
                    <Users className="h-8 w-8 mb-3 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold mb-1">Users</div>
                      <div className="text-xs text-muted-foreground">
                        {canManageUsers ? 'Manage user accounts' : 'View user listings'}
                      </div>
                    </div>
                  </a>
                </Button>

                {/* System Settings - placeholder for future */}
                <Button className="h-auto flex-col py-6 px-4" variant="outline" disabled>
                  <Settings className="h-8 w-8 mb-3 text-muted-foreground" />
                  <div className="text-center">
                    <div className="font-semibold mb-1 text-muted-foreground">Settings</div>
                    <div className="text-xs text-muted-foreground">
                      Coming soon
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Access Level</CardTitle>
              <CardDescription>
                Permissions and capabilities available to your role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {canManageUsers && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="font-medium">Full User Management</span>
                    <span className="text-muted-foreground">- Create, edit, delete users</span>
                  </div>
                )}
                {canViewUsers && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-medium">User List Access</span>
                    <span className="text-muted-foreground">- View and search users</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium">Profile Management</span>
                  <span className="text-muted-foreground">- Manage your own profile</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default AdminPage;