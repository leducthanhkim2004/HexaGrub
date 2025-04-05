'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase/client';
import Header from '../../components/Header';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    authStatus: 'checking',
    session: null,
    profile: null,
    queryResult: null
  });
  const [showDebug, setShowDebug] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchUsers = async () => {
      try {
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session check:', session);
        
        setDebugInfo(prev => ({
          ...prev,
          session: session,
          authStatus: session ? 'session found' : 'no session'
        }));

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Session error: ' + sessionError.message);
          return;
        }

        if (!session) {
          console.log('No session, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('Profile check:', profile);
        
        setDebugInfo(prev => ({
          ...prev,
          profile: profile
        }));

        if (profileError) {
          console.error('Profile error:', profileError);
          setError('Profile error: ' + profileError.message);
          return;
        }

        if (profile.role !== 'admin') {
          console.log('Not an admin, redirecting to home');
          router.push('/');
          return;
        }

        // Fetch all users
        console.log('Fetching users...');
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false, nullsFirst: true })
          .order('id', { ascending: true });

        console.log('Users query result:', usersData);
        
        setDebugInfo(prev => ({
          ...prev,
          queryResult: usersData
        }));

        if (usersError) {
          console.error('Users fetch error:', usersError);
          setError('Error fetching users: ' + usersError.message);
          return;
        }

        if (!usersData || usersData.length === 0) {
          console.log('No users found');
          setUsers([]);
        } else {
          console.log('Users found:', usersData.length);
          setUsers(usersData);
        }

      } catch (error) {
        console.error('Unexpected error:', error);
        setError('Unexpected error: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchUsers();
  }, [router]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Role update error:', error);
        setError('Error updating role: ' + error.message);
        return;
      }

      // Refresh users list
      const { data: updatedUsers, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false, nullsFirst: true })
        .order('id', { ascending: true });

      if (fetchError) {
        console.error('Refresh error:', fetchError);
        setError('Error refreshing users: ' + fetchError.message);
        return;
      }

      setUsers(updatedUsers);
    } catch (error) {
      console.error('Unexpected error during role update:', error);
      setError('Unexpected error: ' + error.message);
    }
  };

  // Debug panel component
  const DebugPanel = () => (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 max-w-md text-sm overflow-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-black">Debug Information</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-black">Status: {debugInfo.authStatus}</p>
        {debugInfo.session && (
          <div className="text-black">
            <p className="font-semibold">Session:</p>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.session, null, 2)}
            </pre>
          </div>
        )}
        {debugInfo.profile && (
          <div className="text-black">
            <p className="font-semibold">Profile:</p>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.profile, null, 2)}
            </pre>
          </div>
        )}
        {debugInfo.queryResult && (
          <div className="text-black">
            <p className="font-semibold">Query Result:</p>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.queryResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-black">User Management</h1>
                <div className="w-32"></div>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Home
            </button>
          </div>
        </div>
        {showDebug && <DebugPanel />}
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-black">User Management</h1>
              <div className="w-32"></div> {/* Spacer for flex alignment */}
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={user.role || 'user'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDebug && <DebugPanel />}
    </>
  );
} 