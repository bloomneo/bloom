import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@voilajsx/uikit/button';
import { AuthLayout } from '@voilajsx/uikit/auth';
import { Alert, AlertTitle, AlertDescription } from '@voilajsx/uikit/alert';
import { User, Mail, Lock, ArrowRight, Loader2, AlertTriangle, Eye, EyeOff, CheckCircle, Phone } from 'lucide-react';
import { SEO } from '../../../shared/components';
import { useAuth } from '../hooks';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    honeypot: '' // Spam protection - hidden field
  });

  // Spam protection state
  const [formStartTime, setFormStartTime] = useState<number>(0);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [interactionCount, setInteractionCount] = useState<number>(0);

  // Initialize form start time
  useEffect(() => {
    setFormStartTime(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Spam protection checks
    const currentTime = Date.now();
    const timeSinceStart = currentTime - formStartTime;
    const timeSinceLastSubmit = currentTime - lastSubmitTime;

    // Block if honeypot field is filled (bot detection)
    if (formData.honeypot) {
      setRegisterError('Please try again later');
      return;
    }

    // Block if submitted too quickly (less than 5 seconds)
    if (timeSinceStart < 5000) {
      setRegisterError('Please take your time to fill out the form');
      return;
    }

    // Rate limiting - block if submitted within 30 seconds
    if (lastSubmitTime > 0 && timeSinceLastSubmit < 30000) {
      const remainingTime = Math.ceil((30000 - timeSinceLastSubmit) / 1000);
      setRegisterError(`Please wait ${remainingTime} seconds before trying again`);
      return;
    }

    // Require minimum interactions (user must interact with at least 3 fields)
    if (interactionCount < 3) {
      setRegisterError('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(currentTime);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setRegisterError('Passwords do not match');
        return;
      }

      if (formData.password.length < 8) {
        setRegisterError('Password must be at least 8 characters long');
        return;
      }

      if (!formData.agreeToTerms) {
        setRegisterError('You must agree to the terms and conditions');
        return;
      }

      // Call the register API
      const result = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        setRegisterError(result.error || 'Registration failed');
      }

    } catch (error: any) {
      setRegisterError(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Track field interactions for spam protection (ignore honeypot)
    if (name !== 'honeypot' && type !== 'checkbox') {
      setInteractionCount(prev => prev + 1);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <>
      <SEO
        title="Sign Up"
        description="Create your account to get started"
        keywords="register, sign up, create account"
      />

      <AuthLayout
        scheme="hero"
        tone="clean"
        size="md"
        title="Create your account"
        subtitle="Sign up to get started with your journey"
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
          // Success Message
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Registration Successful!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your account has been created successfully. Please check your email to verify your account before signing in.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <button
                onClick={() => navigate('/auth/login')}
                className="font-medium text-primary hover:underline bg-transparent border-none cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        ) : (
          // Registration Form
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {registerError && (
              <Alert className="bg-destructive/10 border-destructive text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Registration Failed</AlertTitle>
                <AlertDescription className="text-destructive/80">
                  {registerError}
                </AlertDescription>
              </Alert>
            )}

          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your full name"
              />
            </div>
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
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone number <span className="text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your phone number"
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Create a password"
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
              Confirm password
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
                placeholder="Confirm your password"
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

          {/* Honeypot field - hidden from users, visible to bots */}
          <input
            name="honeypot"
            type="text"
            value={formData.honeypot}
            onChange={handleInputChange}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Terms Agreement */}
          <div className="flex items-center space-x-2">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="agreeToTerms" className="text-sm">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        )}

        {/* Sign In Link - Show only when not success */}
        {!isSuccess && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth/login')}
                className="font-medium text-primary hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </AuthLayout>
    </>
  );
};

export default RegisterPage;