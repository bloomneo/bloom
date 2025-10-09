import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { useApi } from '@voilajsx/uikit/hooks';
import { useTheme } from '@voilajsx/uikit/theme-provider';
import { Server, CheckCircle, XCircle, Loader2, RefreshCw, Palette, Code2, Database } from 'lucide-react';
import { API_BASE_URL } from '../../../lib/api-config';

export const HomePage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [backendChecked, setBackendChecked] = useState(false);
  const [apiInput, setApiInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use UIKit's useApi hook with configured base URL (note: baseURL with capital URL)
  const api = useApi({ baseURL: API_BASE_URL });

  // Custom backend status check
  const checkStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check backend status on mount (only once)
  useEffect(() => {
    checkStatus().then(() => setBackendChecked(true));
  }, []); // Empty deps - run only once on mount

  const handleRefreshStatus = () => {
    setBackendChecked(false);
    checkStatus().then(() => setBackendChecked(true));
  };

  const themes = ['base', 'elegant', 'metro', 'studio', 'vivid'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-primary">
                Hola Helix!
              </h1>
              <Badge variant="default" className="text-sm">
                Basic App
              </Badge>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powered by AppKit + UIKit. Your fullstack application is ready. Start building amazing things with React and Express.
              </p>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Theme:</span>
              {themes.map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Backend Status Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Backend Status
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshStatus}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Real-time connection to your Express API server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {loading && !backendChecked ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <div>
                          <p className="font-medium">Checking connection...</p>
                          <p className="text-sm text-muted-foreground">Testing API endpoint</p>
                        </div>
                      </>
                    ) : isConnected ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Connected</p>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              API Online
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Backend is responding correctly</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Disconnected</p>
                            <Badge variant="destructive">API Offline</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Backend server not responding</p>
                        </div>
                      </>
                    )}
                  </div>

                  {!isConnected && backendChecked && (
                    <Alert>
                      <AlertDescription>
                        <strong>Start your backend:</strong>
                        <br />
                        Run <code className="bg-muted px-1 rounded font-mono">npm run dev:api</code> in a terminal
                        <br />
                        Or run <code className="bg-muted px-1 rounded font-mono">npm run dev</code> for both frontend and backend
                      </AlertDescription>
                    </Alert>
                  )}

                  {isConnected && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-800">
                          Perfect! Your fullstack application is working correctly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Welcome API Test */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Welcome API Test
                </CardTitle>
                <CardDescription>
                  Test your backend API connection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your name..."
                      value={apiInput}
                      onChange={(e) => setApiInput(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          try {
                            const endpoint = apiInput.trim() ? `/api/welcome/${apiInput.trim()}` : '/api/welcome';
                            await api.get(endpoint);
                          } catch (error) {
                            // Error is handled by the api hook
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={async () => {
                        try {
                          const endpoint = apiInput.trim() ? `/api/welcome/${apiInput.trim()}` : '/api/welcome';
                          await api.get(endpoint);
                        } catch (error) {
                          // Error is handled by the api hook
                        }
                      }}
                    >
                      Send
                    </Button>
                  </div>

                  {(api.data || api.error || api.loading) && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">API Response:</p>
                      {api.loading && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs text-muted-foreground">Calling API...</span>
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

                  <p className="text-sm text-muted-foreground text-center">
                    Test the <code className="bg-muted px-1 rounded">/api/welcome</code> endpoint
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <Database className="h-8 w-8 mx-auto text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">Express</p>
                    <p className="text-sm text-muted-foreground">Backend API Server</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Code2 className="h-8 w-8 mx-auto text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">React</p>
                    <p className="text-sm text-muted-foreground">Frontend Application</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 mx-auto text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">Ready</p>
                    <p className="text-sm text-muted-foreground">Start Building</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;