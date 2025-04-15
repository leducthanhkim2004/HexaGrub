'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase/client';
import { restaurantService } from '../../services/restaurantService';
import Header from '../../components/Header';

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkRestaurantOwner();
  }, []);

  const checkRestaurantOwner = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) {
        router.push('/restaurant/create');
        return;
      }

      const restaurantData = await restaurantService.getRestaurantById(profile.restaurant_id);
      setRestaurant(restaurantData);
      setIsOwner(true);
    } catch (error) {
      console.error('Error checking restaurant owner status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
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

          {/* Opening Hours */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-black mb-6">Opening Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurant.opening_hours && Object.entries(restaurant.opening_hours).map(([day, hours]) => (
                <div key={day}>
                  <label className="block text-sm font-medium text-black mb-1 capitalize">
                    {day}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black">
                    {hours}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => router.push('/restaurant/menu')}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-black mb-2">Manage Menu</h3>
              <p className="text-gray-600">Add, edit, or remove menu items</p>
            </div>
            <div
              onClick={() => router.push('/restaurant/orders')}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-black mb-2">Manage Orders</h3>
              <p className="text-gray-600">View and manage incoming orders</p>
            </div>
            <div
              onClick={() => router.push('/restaurant/settings')}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-black mb-2">Settings</h3>
              <p className="text-gray-600">Configure restaurant settings</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 