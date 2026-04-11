import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@bloomneo/uikit/button';
import { AuthLayout } from '@bloomneo/uikit/auth';
import { Alert, AlertTitle, AlertDescription } from '@bloomneo/uikit/alert';
import { Lock, Eye, EyeOff, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { SEO } from '../../../shared/components';
import { useAuthContext } from '../context/AuthContext';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuthContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage('Invalid or missing reset token');
      setIsSuccess(false);
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setMessage('Please fill in all fields');
      setIsSuccess(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await resetPassword({
        token,
        password: formData.password
      });

      if (result.success) {
        setIsSuccess(true);
        setMessage('Your password has been reset successfully');
      } else {
        setIsSuccess(false);
        setMessage(result.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <>
        <SEO
          title="Invalid Reset Link"
          description="Password reset link is invalid or missing"
        />
        <AuthLayout
          scheme="hero"
          tone="clean"
          size="md"
          title="Invalid Reset Link"
          subtitle="This password reset link appears to be invalid"
          logo={
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-primary-foreground">H</span>
            </div>
          }
          imageUrl="https://images.pexels.com/photos/9754/mountains-clouds-forest-fog.jpg"
          imageAlt="Mountains with clouds and forest fog"
          imageOverlay="dark"
        >
          <Alert className="bg-destructive/10 border-destructive text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Invalid Reset Link</AlertTitle>
            <AlertDescription className="text-destructive/80">
              This password reset link is invalid or missing the required token.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Please request a new password reset link.
            </p>
            <Button
              onClick={() => navigate('/auth/forgot-password')}
              className="w-full"
            >
              Request New Reset Link
            </Button>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Reset Password"
        description="Create a new password for your account"
        keywords="reset password, new password, password change"
      />

      <AuthLayout
        scheme="hero"
        tone="clean"
        size="md"
        title="Reset Password"
        subtitle="Enter your new password below"
        logo={
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
        }
        imageUrl="https://images.pexels.com/photos/9754/mountains-clouds-forest-fog.jpg"
        imageAlt="Mountains with clouds and forest fog"
        imageOverlay="dark"
      >
        {isSuccess ? (
          // Success State
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Password Reset Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You can now sign in with your new password.
              </p>
              <Button
                onClick={() => navigate('/auth/login')}
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </div>
          </div>
        ) : (
          // Reset Password Form
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {message && (
              <Alert className="bg-destructive/10 border-destructive text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Reset Failed</AlertTitle>
                <AlertDescription className="text-destructive/80">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter new password"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Confirm new password"
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

              {/* Password Requirements */}
              <div className="text-sm text-muted-foreground">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Must match confirmation</li>
                </ul>
              </div>

              {/* Submit Button */}
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
            </div>
          </form>
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

export default ResetPasswordPage;