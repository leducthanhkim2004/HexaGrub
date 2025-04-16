'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import Header from '../../components/Header';
import NotificationBell from '../../components/NotificationBell';
import { supabase } from '../../lib/supabase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRestaurantId();
    }
  }, [user]);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      
      // Set up real-time subscription for new orders
      const subscription = supabase
        .channel('public:orders')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        }, (payload) => {
          // Add new order to the list
          setOrders(prevOrders => [payload.new, ...prevOrders]);
          // Show toast notification
          toast.success('🔔 New order received!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        })
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [restaurantId]);

  const fetchRestaurantId = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data && data.restaurant_id) {
        setRestaurantId(data.restaurant_id);
      } else {
        // If the user doesn't have a restaurant, redirect to create one
        router.push('/restaurant-admin/create');
      }
    } catch (err) {
      console.error('Error fetching restaurant ID:', err);
      setError('Failed to fetch restaurant information');
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setOrders(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      // Update the state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Please sign in to view restaurant orders</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <ToastContainer />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Orders</h1>
          <div className="relative z-10">
            <NotificationBell />
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
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  order.status === 'pending' ? 'border-2 border-yellow-400' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Order #{order.id.substring(0, 8)}
                        {order.status === 'pending' && (
                          <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">New</span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center">
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600">Total: ${parseFloat(order.total_amount || 0).toFixed(2)}</p>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {order.status !== 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Process Order
                        </button>
                      )}
                      
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Complete Order
                        </button>
                      )}
                      
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 