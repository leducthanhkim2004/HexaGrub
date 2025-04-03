'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, [router]);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch profile data from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error loading profile:', profileError);
    }

    setUser(user);
    setFormData({
      fullName: profile?.full_name || user.user_metadata?.full_name || '',
      email: user.email || ''
    });
    setLoading(false);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any existing messages when user starts typing
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async () => {
    try {
      setMessage({ type: '', text: '' });
      
      // If the name is empty or only whitespace, show error
      if (!formData.fullName.trim()) {
        setMessage({ type: 'error', text: 'Full name cannot be empty' });
        return;
      }

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName.trim()
        }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Refresh user data to get the updated metadata
      await loadProfile();
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      // Revert to the previous name if there's an error
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || ''
      }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-200 to-yellow-100 h-32 rounded-t-lg"></div>
        
        <div className="bg-white rounded-b-lg shadow-md p-6 relative">
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' :
              message.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : ''
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Profile Information Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">{formData.fullName || 'Welcome'}</h1>
                <p className="text-gray-500">
                  Registered on: {new Date(user.created_at).toLocaleDateString('en-US', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-3 border rounded-md bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-700"
                placeholder="Your Full Name"
              />
            </div>

            {/* Email Section */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-1">Email Address</h2>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                <div className="bg-blue-100 p-2 rounded">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500">Primary email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
