/**
 * Setup Guard - Redirects to setup wizard if database needs initialization
 * @file src/desktop/renderer/shared/components/SetupGuard.tsx
 *
 * Checks if the app needs first-run setup and redirects to setup wizard.
 * This component should wrap the main app content.
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SetupStatus {
  needsSetup: boolean;
  loading: boolean;
  error: string | null;
}

// Cache for setup status - stored at module level to persist across component mounts
let setupStatusCache: {
  needsSetup: boolean;
  timestamp: number;
  userCount: number;
} | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the setup status cache
 * Call this after completing setup to force a fresh check
 */
export const clearSetupCache = () => {
  console.log('[SetupGuard] Cache cleared');
  setupStatusCache = null;
};

export const SetupGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SetupStatus>({
    needsSetup: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    console.log('[SetupGuard] Checking setup status, current path:', location.pathname);

    // Skip check if already on setup page
    if (location.pathname === '/setup') {
      console.log('[SetupGuard] Already on setup page, skipping check');
      setStatus({ needsSetup: false, loading: false, error: null });
      return;
    }

    // Check cache first
    const now = Date.now();
    if (setupStatusCache && (now - setupStatusCache.timestamp) < CACHE_DURATION) {
      console.log('[SetupGuard] Using cached setup status:', setupStatusCache);
      if (setupStatusCache.needsSetup) {
        navigate('/setup', { replace: true });
        setStatus({ needsSetup: true, loading: false, error: null });
      } else {
        setStatus({ needsSetup: false, loading: false, error: null });
      }
      return;
    }

    // Check if setup is needed
    const checkSetupStatus = async () => {
      try {
        console.log('[SetupGuard] Fetching setup status from backend...');
        const response = await fetch('http://localhost:3000/api/setup/status');
        console.log('[SetupGuard] Backend response status:', response.status);
        console.log('[SetupGuard] Backend response content-type:', response.headers.get('content-type'));

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('[SetupGuard] ❌ Backend returned non-JSON response:', contentType);
          const text = await response.text();
          console.error('[SetupGuard] Response text (first 200 chars):', text.substring(0, 200));

          // Backend might not be ready yet - assume setup needed to be safe
          console.log('[SetupGuard] Assuming setup needed (backend not responding properly)');
          navigate('/setup', { replace: true });
          setStatus({ needsSetup: true, loading: false, error: 'Backend not ready' });
          return;
        }

        const data = await response.json();
        console.log('[SetupGuard] Backend response data:', data);

        // Cache the result
        setupStatusCache = {
          needsSetup: data.needsSetup || false,
          timestamp: now,
          userCount: data.userCount || 0
        };

        if (data.success && data.needsSetup) {
          console.log('[SetupGuard] ✅ Setup needed! Redirecting to /setup');
          // Redirect to setup wizard
          navigate('/setup', { replace: true });
          setStatus({ needsSetup: true, loading: false, error: null });
        } else {
          console.log('[SetupGuard] ℹ️ Setup not needed, proceeding normally');
          // No setup needed, proceed normally
          setStatus({ needsSetup: false, loading: false, error: null });
        }
      } catch (error: any) {
        console.error('[SetupGuard] ❌ Failed to check setup status:', error);
        console.error('[SetupGuard] Error details:', error.stack || error.message);

        // On error, assume setup needed to be safe
        console.log('[SetupGuard] Assuming setup needed (error occurred)');
        navigate('/setup', { replace: true });
        setStatus({ needsSetup: true, loading: false, error: error.message });
      }
    };

    checkSetupStatus();
  }, [location.pathname, navigate]);

  // Show loading state while checking
  if (status.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking setup status...</p>
        </div>
      </div>
    );
  }

  // If on setup page or setup completed, show children
  return <>{children}</>;
};
