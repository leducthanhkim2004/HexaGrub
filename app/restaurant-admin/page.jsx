'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import NotificationBell from '../components/NotificationBell';
import { supabase } from '../lib/supabase';

export default function RestaurantAdminDashboard() {
  // ... existing states and code ...

  // ... existing useEffect and functions ...

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative z-10">
              <NotificationBell />
            </div>
            <Link 
              href="/restaurant-admin/orders"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{restaurant.name}</h2>
              <p className="text-gray-700 mb-4">{restaurant.description}</p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push(`/restaurant-admin/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Restaurant
                </button>
              </div>
            </div>
            
            {/* New Orders Alert */}
            {stats.pendingOrders > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You have <span className="font-bold">{stats.pendingOrders}</span> pending order{stats.pendingOrders !== 1 ? 's' : ''}! 
                      <Link 
                        href="/restaurant-admin/orders" 
                        className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600"
                      >
                        View now →
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* ... existing stats cards ... */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* ... existing navigation cards ... */}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 