import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@bloomneo/uikit/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bloomneo/uikit/card';
import { Button } from '@bloomneo/uikit/button';
import { Input } from '@bloomneo/uikit/input';
import { Label } from '@bloomneo/uikit/label';
import { Switch } from '@bloomneo/uikit/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bloomneo/uikit/select';
import { Alert, AlertDescription, AlertTitle } from '@bloomneo/uikit/alert';
import { Settings, Save, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Header, Footer, SEO } from '../../../../shared/components';
import { AuthGuard } from '../../../auth';
import { useAuth } from '../../../auth';
import { config } from '../../../auth/config';

const THEMES = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' }
];

const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    'app.name': '',
    'app.theme': 'default',
    'auth.registration_enabled': true
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${config.api.baseUrl}/api/settings`, {
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

        if (data.success && data.settings) {
          setSettings({
            'app.name': data.settings['app.name']?.value || '',
            'app.theme': data.settings['app.theme']?.value || 'default',
            'auth.registration_enabled': data.settings['auth.registration_enabled']?.value || false
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${config.api.baseUrl}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
          [config.auth.headers.auth]: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout>
      <SEO
        title="Admin Settings"
        description="Configure application settings"
      />
      <Header />
      <PageLayout.Content>
        <AuthGuard requiredRoles={['admin.tenant', 'admin.org', 'admin.system']}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Settings className="h-8 w-8" />
                  Application Settings
                </h1>
                <p className="text-muted-foreground">
                  Configure global application settings and preferences
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/user/admin')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
            </div>

            {/* Error/Success Messages */}
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
                <AlertDescription>Settings saved successfully</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading settings...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* General Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Basic application configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="appName">Application Name</Label>
                      <Input
                        id="appName"
                        value={settings['app.name']}
                        onChange={(e) => setSettings({ ...settings, 'app.name': e.target.value })}
                        placeholder="UserApp"
                      />
                      <p className="text-sm text-muted-foreground">
                        This name will appear in the app header and page titles
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Default Theme</Label>
                      <Select
                        value={settings['app.theme']}
                        onValueChange={(value) => setSettings({ ...settings, 'app.theme': value })}
                      >
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {THEMES.map((theme) => (
                            <SelectItem key={theme.value} value={theme.value}>
                              {theme.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        The default theme for new users
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Authentication Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>
                      Configure user registration and authentication options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="registration">Allow User Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable new user registration
                        </p>
                      </div>
                      <Switch
                        id="registration"
                        checked={settings['auth.registration_enabled']}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, 'auth.registration_enabled': checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/user/admin')}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </AuthGuard>
      </PageLayout.Content>
      <Footer />
    </PageLayout>
  );
};

export default AdminSettingsPage;
