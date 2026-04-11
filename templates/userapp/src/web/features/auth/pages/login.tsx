import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle, AuthLayout, Button } from '@bloomneo/uikit';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertTriangle, X } from 'lucide-react';
import { SEO } from '../../../shared/components';
import { useAuth } from '../hooks';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Clear error on successful auth
  useEffect(() => {
    if (isAuthenticated) {
      setLoginError(null);
    }
  }, [isAuthenticated]);


  const clearError = () => {
    setLoginError(null);
  };

  // Show loading screen only on initial auth check, not during login process
  if (isLoading && !loginError && !formData.email && !formData.password) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent double submission
    if (isSubmitting) {
      return false;
    }

    // Clear previous errors
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (!result.success) {
        setLoginError('Invalid username or password');
      }
    } catch (error: any) {
      setLoginError(error.message || 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }

    return false; // Explicitly prevent any form submission behavior
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <>
      <SEO
        title="Sign In"
        description="Access your account to continue"
        keywords="login, sign in, authentication"
      />

      <AuthLayout
        scheme="hero"
        tone="clean"
        size="md"
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        logo={
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
        }
        imageUrl="https://images.pexels.com/photos/9754/mountains-clouds-forest-fog.jpg"
        imageAlt="Mountains with clouds and forest fog"
        imageOverlay="dark"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Display */}
          {loginError && (
            <Alert className="bg-destructive/10 border-destructive text-destructive relative">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription className="text-destructive/80 pr-8">
                {loginError}
              </AlertDescription>
              <button
                onClick={clearError}
                className="absolute right-2 top-2 text-destructive/60 hover:text-destructive transition-colors"
                aria-label="Close alert"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}

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
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="text-sm">
                Remember me
              </label>
            </div>
            <Button variant="link" size="sm" className="px-0" asChild>
              <a href="/auth/forgot-password">
                Forgot password?
              </a>
            </Button>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a
              href="/auth/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default LoginPage;