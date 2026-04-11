import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@bloomneo/uikit/button';
import { AuthLayout } from '@bloomneo/uikit/auth';
import { Alert, AlertTitle, AlertDescription } from '@bloomneo/uikit/alert';
import { Mail, ArrowRight, Loader2, AlertTriangle, CheckCircle, Key, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { SEO } from '../../../shared/components';
import { config } from '../config';

type ResetStep = 'email' | 'pin' | 'contact-admin' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Check email and determine user type
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${config.api.baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.isAdmin) {
          // Admin user - show PIN entry
          setMessage(data.message);
          setStep('pin');
        } else {
          // Regular user - show contact admin message
          setMessage(data.message);
          setStep('contact-admin');
        }
      } else {
        setError(data.message || 'Failed to process request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Reset password with PIN (admin only)
  const handlePinReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError('Recovery PIN must be exactly 4 digits');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${config.api.baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
        },
        body: JSON.stringify({
          email,
          pin,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'Password reset successfully');
        setStep('success');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Forgot Password"
        description="Reset your password to regain access to your account"
        keywords="forgot password, reset password, password recovery"
      />

      <AuthLayout
        scheme="hero"
        tone="clean"
        size="md"
        title={step === 'success' ? 'Password Reset' : 'Forgot Password'}
        subtitle={
          step === 'email' ? 'Enter your email to reset your password' :
          step === 'pin' ? 'Enter your recovery PIN' :
          step === 'contact-admin' ? 'Contact Administrator' :
          'Success'
        }
        logo={
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-primary-foreground">U</span>
          </div>
        }
        imageUrl="https://images.pexels.com/photos/9754/mountains-clouds-forest-fog.jpg"
        imageAlt="Mountains with clouds and forest fog"
        imageOverlay="dark"
      >
        {/* Step 1: Email Entry */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {error && (
              <Alert className="bg-destructive/10 border-destructive text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-destructive/80">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Password Reset</h3>
                <p className="text-muted-foreground">
                  Enter your email address to begin the password reset process.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: PIN Entry (Admin Only) */}
        {step === 'pin' && (
          <form onSubmit={handlePinReset} className="space-y-6">
            {message && (
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <Key className="h-4 w-4" />
                <AlertTitle>Admin Password Reset</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-destructive/10 border-destructive text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-destructive/80">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Recovery PIN (4 digits)
                </label>
                <div className="relative">
                  <input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPin(value);
                    }}
                    className="w-full px-4 pr-10 py-2 border border-input rounded-md bg-background text-foreground text-center tracking-widest text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter 4-digit PIN"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Must match confirmation</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setPin('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowPin(false);
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  setError(null);
                }}
              >
                Back to Email Entry
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Contact Admin (Regular Users) */}
        {step === 'contact-admin' && (
          <div className="space-y-6">
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Contact Administrator</AlertTitle>
              <AlertDescription className="text-amber-700">
                {message}
              </AlertDescription>
            </Alert>

            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                As a regular user, you do not have access to self-service password reset.
                Please contact your system administrator to reset your password.
              </p>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Your Account Email:</p>
                <p className="text-sm text-muted-foreground font-mono">{email}</p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setEmail('');
                  setError(null);
                  setMessage(null);
                }}
              >
                Try Different Email
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Password Reset Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                You can now sign in with your new password.
              </p>

              <Button
                className="w-full"
                onClick={() => navigate('/auth/login')}
              >
                Continue to Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="font-medium text-primary hover:underline bg-transparent border-none cursor-pointer"
            >
              Back to Sign In
            </button>
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default ForgotPasswordPage;
