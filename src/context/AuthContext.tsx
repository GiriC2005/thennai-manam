import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type {
  Session,
  User,
} from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface SignInResult {
  error: string | null;
  isAdmin: boolean;
}

interface SignOutResult {
  error: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<SignInResult>;

  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{
    error: string | null;
  }>;

  signOut: () => Promise<SignOutResult>;

  refreshProfile: () => Promise<void>;

  resetPassword: (
    email: string
  ) => Promise<{
    error: string | null;
  }>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  async function loadProfile(userId: string) {
    try {
      const { data, error } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

      if (error) {
        console.error(
          'Profile loading error:',
          error
        );

        setProfile(null);

        return null;
      }

      const profileData =
        data as Profile | null;

      setProfile(profileData);

      return profileData;
    } catch (error) {
      console.error(
        'Profile error:',
        error
      );

      setProfile(null);

      return null;
    }
  }

  // ==========================================
  // INITIAL AUTH
  // ==========================================

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(
            session.user.id
          );
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          'Auth initialization error:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // ========================================
    // AUTH STATE LISTENER
    // ========================================

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return;

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            setTimeout(() => {
              loadProfile(
                session.user.id
              );
            }, 0);
          } else {
            setProfile(null);
          }

          setLoading(false);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  async function signIn(
    email: string,
    password: string
  ): Promise<SignInResult> {
    try {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return {
          error: error.message,
          isAdmin: false,
        };
      }

      if (!data.user) {
        return {
          error: 'User not found.',
          isAdmin: false,
        };
      }

      const profileData =
        await loadProfile(
          data.user.id
        );

      const admin =
        profileData?.role === 'admin';

      return {
        error: null,
        isAdmin: admin,
      };
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      return {
        error:
          'Unable to login. Please try again.',
        isAdmin: false,
      };
    }
  }

  // ==========================================
  // REGISTER
  // ==========================================

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) {
    try {
      const { error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,

          options: {
            data: {
              full_name: fullName,
              phone,
            },

            emailRedirectTo:
              import.meta.env
                .VITE_SITE_URL ||
              window.location.origin,
          },
        });

      return {
        error:
          error?.message ?? null,
      };
    } catch (error) {
      console.error(
        'Signup error:',
        error
      );

      return {
        error:
          'Unable to create account. Please try again.',
      };
    }
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  async function resetPassword(
    email: string
  ): Promise<{
    error: string | null;
  }> {
    try {
      const cleanEmail = email.trim();

      if (!cleanEmail) {
        return {
          error: 'Please enter your email address.',
        };
      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

      if (error) {
        console.error(
          'Password reset error:',
          error
        );

        return {
          error: error.message,
        };
      }

      return {
        error: null,
      };
    } catch (error) {
      console.error(
        'Password reset error:',
        error
      );

      return {
        error:
          'Unable to send password reset email. Please try again.',
      };
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function signOut(): Promise<SignOutResult> {
    try {
      const { error } =
        await supabase.auth.signOut();

      setUser(null);
      setSession(null);
      setProfile(null);

      if (error) {
        console.error(
          'Supabase signout error:',
          error
        );

        return {
          error: error.message,
        };
      }

      return {
        error: null,
      };
    } catch (error) {
      console.error(
        'Signout error:',
        error
      );

      setUser(null);
      setSession(null);
      setProfile(null);

      return {
        error:
          'Unable to sign out. Please try again.',
      };
    }
  }

  // ==========================================
  // REFRESH PROFILE
  // ==========================================

  async function refreshProfile() {
    if (!user) return;

    await loadProfile(user.id);
  }

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value: AuthContextValue = {
    user,
    profile,
    session,
    loading,

    isAdmin:
      profile?.role === 'admin',

    signIn,
    signUp,
    signOut,
    refreshProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// USE AUTH
// ============================================

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}