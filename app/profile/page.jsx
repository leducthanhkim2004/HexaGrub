'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || ''
      });
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // If the name is empty or only whitespace, keep the previous name
      if (!formData.fullName.trim()) {
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata?.full_name || ''
        }));
        setIsEditing(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName.trim()
        }
      });

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
          {/* Profile Picture and Edit Button */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative -mt-16">
                <img
                  src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/100'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="mt-2">
                <h1 className="text-2xl font-bold">{formData.fullName || 'Welcome'}</h1>
                <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <button
              onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
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
