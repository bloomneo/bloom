/**
 * User Feature Context
 * @file src/web/features/user/context/UserContext.tsx
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth';
import { config } from '../../auth/config';
import type { User, UserProfile, ChangePasswordData, UserContextType, UserState } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [userState, setUserState] = useState<UserState>({
    user: null,
    isLoading: false,
    error: null,
  });


  const makeAuthenticatedRequest = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
        [config.auth.headers.auth]: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the generic message
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }, [token]);

  const getProfile = useCallback(async (): Promise<User | null> => {
    if (!token) return null;

    try {
      setUserState(prev => ({ ...prev, isLoading: true, error: null }));

      const data = await makeAuthenticatedRequest(config.api.endpoints.profile);

      if (data.user) {
        setUserState(prev => ({
          ...prev,
          user: data.user,
          isLoading: false
        }));
        return data.user;
      }
    } catch (error: any) {
      setUserState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch profile',
        isLoading: false
      }));
    }

    return null;
  }, [token, makeAuthenticatedRequest]);

  // Initialize user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !userState.user) {
      getProfile();
    } else if (!isAuthenticated) {
      setUserState({
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, [isAuthenticated, token, getProfile, userState.user]);

  const updateProfile = useCallback(async (data: UserProfile): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setUserState(prev => ({ ...prev, isLoading: true, error: null }));

      const responseData = await makeAuthenticatedRequest(config.api.endpoints.updateProfile, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (responseData.message === 'Profile updated successfully' && responseData.user) {
        const updatedUser = responseData.user;

        // Update UserContext state
        setUserState(prev => ({
          ...prev,
          user: updatedUser,
          isLoading: false
        }));

        // Update AuthContext localStorage to sync the user data across contexts
        localStorage.setItem(config.auth.storage.user, JSON.stringify(updatedUser));

        // Dispatch custom event to notify AuthContext of the update in the same tab
        window.dispatchEvent(new CustomEvent('userUpdated', {
          detail: { user: updatedUser }
        }));

        return { success: true };
      } else {
        setUserState(prev => ({
          ...prev,
          error: responseData.message || 'Update failed',
          isLoading: false
        }));
        return { success: false, error: responseData.message || 'Update failed' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      setUserState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [token, makeAuthenticatedRequest]);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setUserState(prev => ({ ...prev, isLoading: true, error: null }));

      const responseData = await makeAuthenticatedRequest('/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (responseData.message === 'Password changed successfully') {
        setUserState(prev => ({ ...prev, isLoading: false }));
        return { success: true };
      } else {
        const errorMessage = responseData.error || 'Password change failed';
        setUserState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      setUserState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [token, makeAuthenticatedRequest]);

  const refreshProfile = useCallback(async () => {
    await getProfile();
  }, [getProfile]);

  const clearError = useCallback(() => {
    setUserState(prev => ({ ...prev, error: null }));
  }, []);

  const value: UserContextType = {
    ...userState,
    getProfile,
    updateProfile,
    changePassword,
    refreshProfile,
    clearError,
    makeAuthenticatedRequest,
  };

  return (
    <ErrorBoundary>
      <UserContext.Provider value={value}>
        {children}
      </UserContext.Provider>
    </ErrorBoundary>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};