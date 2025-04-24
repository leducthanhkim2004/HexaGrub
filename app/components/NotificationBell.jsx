'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const [newOrders, setNewOrders] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  // Load new orders when component mounts
  useEffect(() => {
    if (user) {
      // Get restaurant ID for the current user
      const getRestaurantId = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('restaurant_id')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (data?.restaurant_id) {
            // Load recent pending orders
            loadPendingOrders(data.restaurant_id);
            
            // Subscribe to new orders and status changes
            subscribeToOrders(data.restaurant_id);
          }
        } catch (err) {
          console.error('Error fetching restaurant ID:', err);
        }
      };
      
      getRestaurantId();
    }
    
    return () => {
      // Clean up subscription
      const subscription = supabase.channel('orders-channel');
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);
  
  // Load recent pending orders
  const loadPendingOrders = async (restaurantId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setNewOrders(data || []);
    } catch (err) {
      console.error('Error loading pending orders:', err);
    }
  };
  
  // Subscribe to new orders and status changes
  const subscribeToOrders = (restaurantId) => {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          // Add new order to the list if it's pending
          const newOrder = payload.new;
          if (newOrder.status === 'pending') {
            setNewOrders(prevOrders => [newOrder, ...prevOrders].slice(0, 5));
          }
        } else if (payload.eventType === 'UPDATE') {
          // Remove order from list if status changed from pending
          const updatedOrder = payload.new;
          if (updatedOrder.status !== 'pending') {
            setNewOrders(prevOrders => 
              prevOrders.filter(order => order.id !== updatedOrder.id)
            );
          }
        }
      })
      .subscribe();

    return subscription;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle click on an order
  const handleOrderClick = (orderId) => {
    router.push(`/restaurant/orders/${orderId}`);
    setShowDropdown(false);
  };
  
  // Mark all as viewed
  const markAllAsViewed = async () => {
    if (newOrders.length === 0) return;
    
    try {
      const orderIds = newOrders.map(order => order.id);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: 'viewed' })
        .in('id', orderIds)
        .eq('status', 'pending');

      if (error) throw error;
        
      // Update local state immediately
      setNewOrders([]);
      setShowDropdown(false);
    } catch (err) {
      console.error('Error marking orders as viewed:', err);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="relative">
      {/* Bell icon with counter */}
      <button 
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Notification badge */}
        {newOrders.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center p-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {newOrders.length}
          </span>
        )}
      </button>
      
      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">New Orders</h3>
              {newOrders.length > 0 && (
                <button 
                  onClick={markAllAsViewed}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as viewed
                </button>
              )}
            </div>
            
            {newOrders.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm text-gray-500">
                No new orders
              </div>
            ) : (
              <div>
                {newOrders.map(order => (
                  <div 
                    key={order.id}
                    className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          New Order #{order.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Total: ${order.total_amount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                ))}
                
                <div className="px-4 py-2 text-center">
                  <button
                    onClick={() => router.push('/restaurant/orders')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View all orders
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 