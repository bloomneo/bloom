/**
 * Setup Wizard - First-run setup for creating admin account
 * @file src/desktop/renderer/features/setup/pages/index.tsx
 *
 * This page is shown on first app launch to initialize the database
 * and create the admin account.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@voilajsx/uikit/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Alert, AlertDescription, AlertTitle } from '@voilajsx/uikit/alert';
import { UserPlus, CheckCircle, AlertTriangle, Loader2, Wifi, WifiOff, ShieldAlert, Key, Eye, EyeOff } from 'lucide-react';
import { SEO, clearSetupCache } from '../../../shared/components';

export default function SetupWizardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    recoveryPin: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRecoveryPin, setShowRecoveryPin] = useState(false);

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('[SetupWizard] Checking backend health...');
        }
        const response = await fetch('http://localhost:3000/health');

        if (response.ok) {
          if (import.meta.env.DEV) {
            console.log('[SetupWizard] ✅ Backend is online');
          }
          setBackendStatus('online');
        } else {
          if (import.meta.env.DEV) {
            console.log('[SetupWizard] ❌ Backend returned non-OK status:', response.status);
          }
          setBackendStatus('offline');
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[SetupWizard] ❌ Backend health check failed:', err);
        }
        setBackendStatus('offline');
      }
    };

    checkBackend();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.recoveryPin) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!/^\d{4}$/.test(formData.recoveryPin)) {
      setError('Recovery PIN must be exactly 4 digits');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API to setup database
      const response = await fetch('http://localhost:3000/api/setup/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          recoveryPin: formData.recoveryPin,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Setup failed');
      }

      setSuccess(true);

      // Clear the SetupGuard cache so it checks status again
      clearSetupCache();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to setup database');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <PageLayout>
        <SEO title="Setup Complete" description="Database setup completed successfully" />
        <PageLayout.Content>
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  <h2 className="text-2xl font-bold">Setup Complete!</h2>
                  <p className="text-muted-foreground">
                    Your <strong>admin.system</strong> account has been created successfully with full access.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to login...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout.Content>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO title="Setup Wizard" description="Initial setup for UserApp" />
      <PageLayout.Content>
        <div className="flex items-center justify-center min-h-screen py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Welcome to UserApp</CardTitle>
              <CardDescription>
                Let's set up your admin account to get started
              </CardDescription>

              {/* Backend Status Indicator */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                {backendStatus === 'checking' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Checking backend...</span>
                  </>
                )}
                {backendStatus === 'online' && (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Backend Online</span>
                  </>
                )}
                {backendStatus === 'offline' && (
                  <>
                    <WifiOff className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">Backend Offline</span>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Password Reminder Alert */}
              <Alert className="mb-6 bg-amber-500/10 border-amber-500/50">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700">Important: Save Your Credentials</AlertTitle>
                <AlertDescription className="text-amber-600">
                  This will create your <strong>admin account</strong> with full system access.
                  Please save your password and recovery PIN securely. You'll need the PIN if you forget your password.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert className="mb-6 bg-destructive/10 border-destructive text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="admin@example.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      disabled={isLoading}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      disabled={isLoading}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="recoveryPin" className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Recovery PIN (4 digits)
                  </label>
                  <div className="relative">
                    <Input
                      id="recoveryPin"
                      type={showRecoveryPin ? "text" : "password"}
                      inputMode="numeric"
                      pattern="\d{4}"
                      maxLength={4}
                      value={formData.recoveryPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        handleInputChange('recoveryPin', value);
                      }}
                      placeholder="Enter 4-digit PIN"
                      disabled={isLoading}
                      required
                      className="text-center tracking-widest text-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryPin(!showRecoveryPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showRecoveryPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this PIN to recover your account if you forget your password
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || backendStatus !== 'online'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : backendStatus === 'offline' ? (
                    <>
                      <WifiOff className="mr-2 h-4 w-4" />
                      Backend Offline
                    </>
                  ) : backendStatus === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Backend...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Admin Account
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground mt-4 space-y-1">
                  <p>This will initialize the database and create your <strong>admin.system</strong> account</p>
                  <p className="text-amber-600">⚠️ Remember to save your password and PIN</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
}
