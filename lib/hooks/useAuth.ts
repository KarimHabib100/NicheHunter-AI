'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useState } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
          return false;
        }

        return true;
      } catch (err) {
        setError('An unexpected error occurred');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Registration failed');
          return false;
        }

        return await login(email, password);
      } catch (err) {
        setError('An unexpected error occurred');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const loginWithProvider = useCallback(async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading' || isLoading,
    error,
    login,
    register,
    loginWithProvider,
    logout,
    clearError: () => setError(null),
  };
}
