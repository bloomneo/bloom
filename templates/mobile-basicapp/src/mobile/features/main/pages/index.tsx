import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, useApi, useTheme } from '@bloomneo/uikit';
import { Server, CheckCircle, XCircle, Loader2, RefreshCw, Palette } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

// Platform-aware API URL detection
const getApiUrl = (): string => {
  // If environment variable is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Auto-detect based on platform
  const platform = Capacitor.getPlatform();

  if (platform === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return 'http://10.0.2.2:3000';
  } else if (platform === 'ios') {
    // iOS simulator can access localhost directly
    return 'http://localhost:3000';
  } else {
    // Web fallback
    return 'http://localhost:3000';
  }
};

export const HomePage: React.FC = () => {
  const API_URL = getApiUrl();

  // UIKit hooks - useApi with explicit baseURL
  const api = useApi({ baseURL: API_URL });
  const { theme, setTheme } = useTheme();

  // Custom backend status (bypassing UIKit hook that doesn't work on mobile)
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendChecked, setBackendChecked] = useState(false);
  const [apiInput, setApiInput] = useState('');

  // Custom backend status check
  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setIsConnected(data.status === 'ok');
      return data.status === 'ok';
    } catch (error) {
      setIsConnected(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check backend status on mount
  useEffect(() => {
    checkStatus().then(() => setBackendChecked(true));
  }, []);

  const handleRefreshStatus = () => {
    setBackendChecked(false);
    checkStatus().then(() => setBackendChecked(true));
  };

  const themes = ['base', 'elegant', 'metro', 'studio', 'vivid'];

  return (
    <div className="h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="px-4 py-6 space-y-6 pb-20">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-3 pt-4">
            <img
              src="https://i.ibb.co/BV3NKLtT/helix.png"
              alt="Bloom"
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-3xl font-bold text-primary">
              Hola Bloom!
            </h1>
          </div>
          <Badge variant="default" className="text-sm">
            Mobile App
          </Badge>
          <p className="text-sm text-muted-foreground">
            Powered by UIKit + Capacitor
          </p>

          {/* Theme Selector */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Palette className="h-4 w-4 text-muted-foreground" />
            {themes.map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(t)}
                className="capitalize min-w-[60px] h-9"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Cards */}
        <div className="space-y-4">

          {/* Backend Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Backend Status
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshStatus}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {loading && !backendChecked ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Checking...</p>
                        <p className="text-xs text-muted-foreground">Testing API</p>
                      </div>
                    </>
                  ) : isConnected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">Connected</p>
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Online
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">API responding</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">Disconnected</p>
                          <Badge variant="destructive" className="text-xs">Offline</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Server not responding</p>
                      </div>
                    </>
                  )}
                </div>

                {!isConnected && backendChecked && (
                  <Alert className="text-xs">
                    <AlertDescription>
                      Start backend: <code className="bg-muted px-1 rounded text-xs">npm run dev:api</code>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Test Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Test</CardTitle>
              <CardDescription className="text-xs">
                Test backend connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Your name..."
                    value={apiInput}
                    onChange={(e) => setApiInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        try {
                          const endpoint = apiInput.trim() ? `/api/welcome/${apiInput.trim()}` : '/api/welcome';
                          await api.get(endpoint);
                        } catch (error) {
                          // Error handled by hook
                        }
                      }
                    }}
                    className="h-10"
                  />
                  <Button
                    onClick={async () => {
                      try {
                        const endpoint = apiInput.trim() ? `/api/welcome/${apiInput.trim()}` : '/api/welcome';
                        await api.get(endpoint);
                      } catch (error) {
                        // Error handled by hook
                      }
                    }}
                    className="h-10 min-w-[70px]"
                  >
                    Send
                  </Button>
                </div>

                {(api.data || api.error || api.loading) && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs font-medium mb-1">Response:</p>
                    {api.loading && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      </div>
                    )}
                    {api.error && (
                      <pre className="text-xs text-red-600 whitespace-pre-wrap">Error: {api.error}</pre>
                    )}
                    {api.data && !api.loading && (
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(api.data, null, 2)}</pre>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;