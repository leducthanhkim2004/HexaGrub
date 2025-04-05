'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase/client';
import Link from 'next/link';
import Header from '../../components/Header';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState(null);
  const router = useRouter();

  const handleNavigation = (path) => {
    setNavigatingTo(path);
    router.push(path);
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Step 1: Get session with more detailed logging
        console.log('Checking session...');
        
        // First check if we have a session in localStorage
        const storedSession = localStorage.getItem('supabase.auth.token');
        console.log('Stored session in localStorage:', storedSession);

        // Get current session
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Current session:', session);
        
        // If no session but we have a stored session, try to restore it
        if (!session && storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            console.log('Attempting to restore session from localStorage:', parsedSession);
            const { data: { session: restoredSession }, error: restoreError } = await supabase.auth.setSession({
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token
            });
            
            if (restoreError) {
              console.error('Session restore error:', restoreError);
              localStorage.removeItem('supabase.auth.token');
            } else {
              console.log('Session restored successfully:', restoredSession);
              session = restoredSession;
            }
          } catch (e) {
            console.error('Error parsing stored session:', e);
            localStorage.removeItem('supabase.auth.token');
          }
        }
        
        // If still no session, try to refresh it
        if (!session) {
          console.log('No session found, attempting to refresh...');
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Refresh error:', refreshError);
            router.push('/login');
            return;
          }

          if (refreshedSession) {
            console.log('Session refreshed successfully:', refreshedSession);
            session = refreshedSession;
          } else {
            console.log('No session after refresh, redirecting to login');
            router.push('/login');
            return;
          }
        }

        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        // Step 2: Get profile
        console.log('Fetching profile...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('User profile:', profile);
        console.log('User role:', profile?.role);

        if (profileError) {
          console.error('Profile error:', profileError);
          return;
        }

        // Step 3: Check admin role
        if (profile.role !== 'admin') {
          console.log('User is not an admin, role is:', profile.role);
          return;
        }

        console.log('User is an admin');
        setIsAdmin(true);

      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        console.log('Session event:', event, 'checking auth...');
        checkAuth();
      }
    });

    // Initial auth check
    checkAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <h1 className="text-3xl font-bold text-black mb-8">Admin Dashboard</h1>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
                <button 
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-black mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Menu Management Card */}
              <div 
                onClick={() => handleNavigation('/admin/menu')}
                className={`bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer relative ${
                  navigatingTo === '/admin/menu' ? 'opacity-50' : ''
                }`}
              >
                {navigatingTo === '/admin/menu' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <h3 className="text-lg font-medium text-black">Menu Management</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Add, edit, or remove menu items
                </p>
              </div>

              {/* Orders Management Card */}
              <div 
                onClick={() => handleNavigation('/admin/orders')}
                className={`bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer relative ${
                  navigatingTo === '/admin/orders' ? 'opacity-50' : ''
                }`}
              >
                {navigatingTo === '/admin/orders' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <h3 className="text-lg font-medium text-black">Orders Management</h3>
                <p className="mt-2 text-sm text-gray-600">
                  View and manage all orders
                </p>
              </div>

              {/* User Management Card */}
              <div 
                onClick={() => handleNavigation('/admin/users')}
                className={`bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer relative ${
                  navigatingTo === '/admin/users' ? 'opacity-50' : ''
                }`}
              >
                {navigatingTo === '/admin/users' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <h3 className="text-lg font-medium text-black">User Management</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Manage user accounts and roles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 