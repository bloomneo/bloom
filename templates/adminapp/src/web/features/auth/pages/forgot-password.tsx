import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle, AuthLayout, Button } from '@bloomneo/uikit';
import { Mail, ArrowRight, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { SEO } from '../../../shared/components';
import { useAuthContext } from '../context/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { forgotPassword } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await forgotPassword({ email });

      if (result.success) {
        setIsSuccess(true);
        setMessage('Password reset instructions have been sent to your email');
      } else {
        setIsSuccess(false);
        setMessage(result.error || 'Failed to send password reset email. Please try again.');
      }
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(error.message || 'Failed to send password reset email. Please try again.');
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
        title="Forgot Password"
        subtitle="Enter your email to receive password reset instructions"
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
              <AlertTitle>Check Your Email</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                If you don't receive an email within a few minutes, please check your spam folder.
              </p>

              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage(null);
                    setEmail('');
                  }}
                  className="w-full"
                >
                  Send Another Email
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Forgot Password Form
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error/Info Display */}
            {message && (
              <Alert className={isSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-destructive/10 border-destructive text-destructive'}>
                {isSuccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertTitle>{isSuccess ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription className={isSuccess ? 'text-green-700' : 'text-destructive/80'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Password Reset</h3>
                <p className="text-muted-foreground">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Email Field */}
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

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <a
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Back to Sign In
            </a>
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default ForgotPasswordPage;