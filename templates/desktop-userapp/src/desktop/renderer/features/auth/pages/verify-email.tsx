import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@voilajsx/uikit/button';
import { AuthLayout } from '@voilajsx/uikit/auth';
import { Alert, AlertTitle, AlertDescription } from '@voilajsx/uikit/alert';
import { CheckCircle, Loader2, AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { SEO } from '../../../shared/components';
import { useAuthContext } from '../context/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const { verifyEmail, resendVerification } = useAuthContext();

  useEffect(() => {
    if (!token) {
      setVerificationState('no-token');
      return;
    }

    // Verify email with token
    const handleVerifyEmail = async () => {
      try {
        const result = await verifyEmail({ token });

        if (result.success) {
          setVerificationState('success');
          // Note: Backend doesn't return user data on verification, just success
        } else {
          setVerificationState('error');
          setErrorMessage(result.error || 'Verification failed');
        }
      } catch (error: any) {
        setVerificationState('error');
        setErrorMessage(error.message || 'Verification failed');
      }
    };

    handleVerifyEmail();
  }, [token, verifyEmail]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail) {
      setResendMessage('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setResendMessage(null);

    try {
      const result = await resendVerification(resendEmail);

      if (result.success) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(result.error || 'Failed to send verification email');
      }
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to send verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Verifying your email...</h3>
              <p className="text-muted-foreground mt-2">
                Please wait while we verify your email address.
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Email Verified Successfully!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your email address has been verified. You can now sign in to your account.
              </AlertDescription>
            </Alert>


            <div className="text-center">
              <Button asChild className="w-full">
                <a href="/auth/login">
                  Continue to Sign In
                </a>
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6">
            <Alert className="bg-destructive/10 border-destructive text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription className="text-destructive/80">
                {errorMessage || 'We could not verify your email address.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Need a new verification link?</h3>
                <p className="text-muted-foreground mt-2">
                  Enter your email address and we'll send you a new verification link.
                </p>
              </div>

              <form onSubmit={handleResendVerification} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resend-email" className="text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      id="resend-email"
                      name="resend-email"
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={resendLoading}>
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                {resendMessage && (
                  <Alert className={resendMessage.includes('sent') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-destructive/10 border-destructive text-destructive'}>
                    {resendMessage.includes('sent') ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription className={resendMessage.includes('sent') ? 'text-green-700' : 'text-destructive/80'}>
                      {resendMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </div>
          </div>
        );

      case 'no-token':
        return (
          <div className="space-y-6">
            <Alert className="bg-destructive/10 border-destructive text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Invalid Verification Link</AlertTitle>
              <AlertDescription className="text-destructive/80">
                This verification link appears to be invalid or missing the required token.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                If you need a new verification link, please enter your email address below.
              </p>

              <form onSubmit={handleResendVerification} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resend-email" className="text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      id="resend-email"
                      name="resend-email"
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={resendLoading}>
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Send Verification Email
                    </>
                  )}
                </Button>

                {resendMessage && (
                  <Alert className={resendMessage.includes('sent') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-destructive/10 border-destructive text-destructive'}>
                    {resendMessage.includes('sent') ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription className={resendMessage.includes('sent') ? 'text-green-700' : 'text-destructive/80'}>
                      {resendMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SEO
        title="Verify Email"
        description="Verify your email address to complete registration"
        keywords="email verification, verify account"
      />

      <AuthLayout
        scheme="hero"
        tone="clean"
        size="md"
        title="Email Verification"
        subtitle="Confirm your email address to activate your account"
        logo={
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
        }
        imageUrl="https://images.pexels.com/photos/9754/mountains-clouds-forest-fog.jpg"
        imageAlt="Mountains with clouds and forest fog"
        imageOverlay="dark"
      >
        {renderContent()}

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already verified?{' '}
            <a
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in to your account
            </a>
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default VerifyEmailPage;