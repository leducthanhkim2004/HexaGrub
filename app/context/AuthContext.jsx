'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authListener = null;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up auth state listener
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    error,
    setUser,
    setProfile,
    refreshProfile: () => user && fetchProfile(user.id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 