'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't do anything while auth is loading
    if (authLoading) return;

    // If not authenticated after auth loading completes, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const fetchRestaurantData = async () => {
      try {
        // Get user's profile to check restaurant ownership
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile.restaurant_id) {
          console.log('No restaurant found, redirecting to create page');
          router.push('/restaurant/create');
          return;
        }

        // Get restaurant data
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', profile.restaurant_id)
          .single();

        if (restaurantError) throw restaurantError;

        setRestaurant(restaurantData);
        setIsOwner(true);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [user, router, authLoading, isAuthenticated]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching restaurant data
  if (loading && !error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              router.refresh();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner || !restaurant) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-red-600">Not authorized to view this page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">Restaurant Dashboard</h1>
            <button
              onClick={() => router.push('/restaurant/edit')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Restaurant
            </button>
          </div>

          {/* Restaurant Info Card */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-black mb-6">Restaurant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Name</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black">
                  {restaurant.name}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black">
                  {restaurant.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Phone</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black">
                  {restaurant.phone}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Address</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black">
                  {restaurant.address}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Description</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black min-h-[80px]">
                  {restaurant.description}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => router.push('/restaurant/orders')}
              className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Manage Orders</h3>
              <p className="text-blue-100">View and manage customer orders</p>
            </button>
            <button
              onClick={() => router.push('/restaurant/menu')}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-black mb-2">Manage Menu</h3>
              <p className="text-gray-600">Add, edit, or remove menu items</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 