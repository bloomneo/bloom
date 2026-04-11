import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageLayout } from '@bloomneo/uikit';
import { User, Mail, Shield } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';
import { useAuth } from '../../auth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <PageLayout>
      <SEO
        title="Dashboard"
        description="User dashboard with account information"
      />
      <Header />

      <PageLayout.Content>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user.name || user.email.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's your account overview
            </p>
          </div>

          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{user.role}</p>
                    </div>
                  </div>
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

export default Dashboard;
