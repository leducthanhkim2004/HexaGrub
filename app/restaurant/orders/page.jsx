'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('Current user:', user.id);
    fetchOrders();

    // Set up real-time subscription for orders
    const channel = supabase
      .channel('restaurant-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Received order update:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    // Refresh orders every 30 seconds as a fallback
    const interval = setInterval(fetchOrders, 30000);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setError(null);

      // Get user's profile with restaurant_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('restaurant_id, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('User profile:', profile);

      if (!profile?.restaurant_id) {
        console.log('No restaurant_id found for user');
        router.push('/restaurant/create');
        return;
      }

      // Fetch orders for the restaurant
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone_number
          ),
          restaurant:restaurant_id (
            name
          ),
          order_items (
            *,
            menu_items (
              name
            )
          )
        `)
        .eq('restaurant_id', profile.restaurant_id)
        .in('status', ['pending', 'completed']);

      if (ordersError) {
        console.error('Orders error:', ordersError);
        throw ordersError;
      }

      console.log('Fetched orders:', JSON.stringify(ordersData, null, 2));
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setError(null);
      
      // First check if the order is still pending
      const { data: order, error: checkError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (checkError) throw checkError;
      
      if (order.status !== 'pending') {
        throw new Error('Only pending orders can be deleted');
      }

      // Call the delete_order function
      const { error: deleteError } = await supabase
        .rpc('delete_order', { order_id: orderId });

      if (deleteError) throw deleteError;

      // Update the local state
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      setError(error.message);
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
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">Manage Orders</h1>
            <button
              onClick={() => router.push('/restaurant/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.profiles.full_name}</div>
                        <div className="text-sm text-gray-500">{order.profiles.email}</div>
                        {order.profiles.phone_number && (
                          <div className="text-sm text-gray-500">{order.profiles.phone_number}</div>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          {order.delivery_address || <span className="text-gray-400">N/A</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item) => (
                              <div key={item.id}>
                                {item.quantity}x {item.menu_items?.name || item.item_name || 'Item'} (${parseFloat(item.price_at_time).toFixed(2)})
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">No items</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 