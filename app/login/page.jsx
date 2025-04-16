'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (signInError) {
        throw signInError;
      }

      // Check user's profile for role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, restaurant_id')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Redirect based on role
      if (profile?.role === 'restaurant_owner' && profile?.restaurant_id) {
        router.push('/restaurant/dashboard');
      } else if (profile?.role === 'restaurant_owner') {
        router.push('/restaurant/create');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>
            
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center mt-4">
                <a href="/signup" className="text-blue-600 hover:text-blue-800">
                  Don't have an account? Sign up
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}